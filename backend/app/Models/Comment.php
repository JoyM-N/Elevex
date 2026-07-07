<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Comment Model
 *
 * Comments can be left on both Tasks and Logbooks.
 * Instead of two separate tables (task_comments, logbook_comments)
 * we use Laravel's polymorphic relationship — one table handles both.
 *
 * How polymorphic works here:
 *   commentable_type stores the model class name
 *     e.g. 'App\Models\Task' or 'App\Models\Logbook'
 *   commentable_id stores the ID of that specific record
 *
 * So when you call $task->comments it fetches all rows where:
 *   commentable_type = 'App\Models\Task'
 *   commentable_id   = $task->id
 *
 * And $logbook->comments fetches all rows where:
 *   commentable_type = 'App\Models\Logbook'
 *   commentable_id   = $logbook->id
 *
 * SoftDeletes:
 *   Comments are soft deleted so we can recover accidentally
 *   deleted feedback without losing the audit trail.
 *
 * Relationships:
 *   user        — who wrote this comment
 *   commentable — the Task or Logbook being commented on
 */
class Comment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'commentable_id',
        'commentable_type',
        'body',
    ];

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The user who wrote this comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The model this comment belongs to — Task or Logbook.
     *
     * MorphTo is the inverse of MorphMany.
     * It says: "look at commentable_type to know which
     * model to load, then use commentable_id to find it."
     *
     * Usage:
     *   $comment->commentable — returns either a Task or Logbook instance
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }
}