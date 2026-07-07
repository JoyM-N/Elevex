<?php

namespace App\Models;

use App\Enums\RecommendationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * RecommendationLetter Model
 *
 * Stores metadata about a recommendation letter request.
 * The actual letter content is NEVER stored in the database.
 *
 * Why not store the letter text?
 * Because the letter is generated FROM live data:
 *   - intern's performance metrics
 *   - supervisor remarks from evaluations
 *   - skills demonstrated during internship
 *   - achievements earned (translated to professional language)
 *
 * Storing the text would mean it immediately becomes stale
 * the moment any underlying data changes.
 *
 * Instead:
 *   RecommendationService pulls live data
 *   → generates PDF
 *   → stores PDF on disk
 *   → saves the path in pdf_path column here
 *
 * Status flow:
 *   pending  — intern requested, waiting for admin approval
 *   approved — admin approved, PDF generated, intern can download
 *   rejected — admin declined the request
 *
 * Relationships:
 *   user        — the intern this letter is for
 *   internship  — which internship this letter covers
 *   approvedBy  — the admin who approved and triggered generation
 */
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
    ];

    protected function casts(): array
    {
        return [
            'status'       => RecommendationStatus::class,
            'generated_at' => 'datetime',
            'approved_at'  => 'datetime',
        ];
    }

    // =========================================================
    // Helper Methods
    // =========================================================

    /**
     * Is this letter approved and ready to download?
     */
    public function isApproved(): bool
    {
        return $this->status === RecommendationStatus::Approved;
    }

    /**
     * Is this letter still waiting for admin action?
     */
    public function isPending(): bool
    {
        return $this->status === RecommendationStatus::Pending;
    }

    /**
     * Has a PDF been generated for this letter?
     */
    public function hasPdf(): bool
    {
        return !is_null($this->pdf_path);
    }

    /**
     * Get the full download URL for the generated PDF.
     * Returns null if no PDF has been generated yet.
     *
     * Uses Laravel Storage facade so this works
     * transparently on both local and S3 storage.
     */
    public function getPdfUrlAttribute(): ?string
    {
        if (!$this->hasPdf()) {
            return null;
        }

        return Storage::disk('public')->url($this->pdf_path);
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * The intern this recommendation letter is for.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The internship period this letter covers.
     */
    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }

    /**
     * The admin who approved this letter request.
     * Null until an admin takes action.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}