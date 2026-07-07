<?php

namespace App\Models;

use App\Enums\TeamRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

/**
 * ProjectMember Model
 *
 * Represents the pivot between projects and users.
 * This is not just a simple pivot — it carries extra data (team_role)
 * which is why it has its own dedicated Model.
 *
 * In Laravel, when a pivot table carries extra columns beyond
 * just the two foreign keys, we create a dedicated Model for it
 * extending Model (not Pivot) so we can use it independently.
 *
 * Example:
 *   An intern can be 'backend' on Project A
 *   and 'solo' on Project B.
 *   Each of those is a separate ProjectMember record.
 *
 * Relationships:
 *   project — the project this membership belongs to
 *   user    — the intern who is a member
 */
class ProjectMember extends Model
{
    use HasFactory;

    protected $table = 'project_members';

    protected $fillable = [
        'project_id',
        'user_id',
        'team_role',
    ];

    protected function casts(): array
    {
        return [
            // team_role is cast to TeamRole enum
            // so $member->team_role returns TeamRole::Backend
            // instead of the plain string 'backend'
            'team_role' => TeamRole::class,
        ];
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The project this membership record belongs to.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * The intern who is a member of this project.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}