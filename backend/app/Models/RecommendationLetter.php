<?php

namespace App\Models;

use App\Enums\RecommendationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecommendationLetter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'internship_id',
        'approved_by',
        'status',
        'pdf_path',
        'generated_at',
        'approved_at',
        'admin_notes',
        'body',
    ];

    protected function casts(): array
    {
        return [
            'status'       => RecommendationStatus::class,
            'generated_at' => 'datetime',
            'approved_at'  => 'datetime',
        ];
    }

    public function isApproved(): bool
    {
        return $this->status === RecommendationStatus::Approved;
    }

    public function isPending(): bool
    {
        return $this->status === RecommendationStatus::Pending;
    }

    public function hasPdf(): bool
    {
        return !is_null($this->pdf_path);
    }

    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->hasPdf()) {
            return null;
        }

        // Public disk files are served from /storage/...
        return asset('storage/' . ltrim((string) $this->pdf_path, '/'));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}