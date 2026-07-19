<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * SickDay Model
 *
 * Represents an intern's sick day request.
 * Approved sick days are excluded from attendance
 * and consistency score calculations.
 *
 * Full workflow (request + approval + notifications)
 * implemented in Phase 10.
 */
class SickDay extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'reason',
        'proof_path',
        'approved_by',
        'status',
        'approved_at',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'date'        => 'date',
            'approved_at' => 'datetime',
        ];
    }

    // =========================================================
    // Helper Methods
    // =========================================================

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The intern who submitted this sick day request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The admin who approved or rejected this request.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}