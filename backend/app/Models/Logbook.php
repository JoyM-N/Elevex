<?php

namespace App\Models;

use App\Enums\LogbookStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Logbook extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'approved_by',
        'date',
        'hours_worked',
        'description',
        'blockers',
        'learning_outcome',
        'status',
        'revision_note',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'date'        => 'date',
            'reviewed_at' => 'datetime',
            'status'      => LogbookStatus::class,
            'hours_worked' => 'decimal:2',
        ];
    }

    public function isLocked(): bool
    {
        return $this->status->isLocked();
    }

    public function isApproved(): bool
    {
        return $this->status === LogbookStatus::Approved;
    }

    public function isPendingReview(): bool
    {
        return $this->status === LogbookStatus::Submitted;
    }

    public function needsRevision(): bool
    {
        return $this->status === LogbookStatus::RevisionNeeded;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function fileUploads(): MorphMany
    {
        return $this->morphMany(FileUpload::class, 'uploadable');
    }
}