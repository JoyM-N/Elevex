<?php

namespace App\Services;

use App\Enums\RecommendationStatus;
use App\Models\RecommendationLetter;
use App\Models\User;
use App\Services\Reports\Builders\PerformanceReportBuilder;
use App\Services\Reports\Exports\PdfExporter;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

/**
 * RecommendationService
 *
 * Manages recommendation letter requests and generation.
 *
 * Key design decision:
 *   Letter content is NEVER stored in the database.
 *   The letter is generated from live data every time.
 *   Only the PDF path is stored.
 *
 * Flow:
 *   1. Intern requests a letter (creates pending record)
 *   2. Admin approves the request
 *   3. RecommendationService pulls live data via PerformanceReportBuilder
 *   4. Generates PDF via PdfExporter
 *   5. Stores PDF path in recommendation_letters table
 *   6. Intern downloads via the stored path
 *
 * Achievement names are translated to professional language
 * before being included in the letter — "Fast Finisher" becomes
 * "demonstrated exceptional ability to deliver work ahead of schedule"
 */
class RecommendationService
{
    public function __construct(
        private readonly PerformanceReportBuilder $performanceBuilder,
        private readonly PdfExporter              $pdfExporter
    ) {}

    /**
     * Intern requests a recommendation letter.
     * Creates a pending record — admin must approve before PDF is generated.
     *
     * @throws ValidationException if letter already requested for this internship
     */
    public function requestLetter(User $intern, int $internshipId): RecommendationLetter
    {
        // Check if a letter already exists for this internship
        $exists = RecommendationLetter::where('user_id', $intern->id)
            ->where('internship_id', $internshipId)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'internship_id' => ['A recommendation letter has already been requested for this internship.'],
            ]);
        }

        return RecommendationLetter::create([
            'user_id'       => $intern->id,
            'internship_id' => $internshipId,
            'status'        => RecommendationStatus::Pending,
        ]);
    }

    /**
     * Admin approves a recommendation letter request.
     * Triggers PDF generation from live intern data.
     *
     * @throws ModelNotFoundException
     * @throws ValidationException
     */
    public function approveLetter(int $letterId, User $admin): RecommendationLetter
    {
        $letter = RecommendationLetter::with(['user', 'internship'])->findOrFail($letterId);

        if (!$letter->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending letters can be approved.'],
            ]);
        }

        // Build performance data for the letter
        $performanceData = $this->performanceBuilder->build($letter->user);

        // Translate achievements to professional language
        $performanceData['achievements'] = $this->translateAchievements(
            $performanceData['achievements']
        );

        // Generate the PDF
        $pdfPath = $this->pdfExporter->generate(
            view: 'pdfs.recommendation',
            data: [
                'intern'      => $letter->user,
                'internship'  => $letter->internship,
                'admin'       => $admin,
                'performance' => $performanceData,
                'letter'      => $letter,
            ],
            folder: 'letters'
        );

        // Update the record with PDF path and approval info
        $letter->update([
            'status'       => RecommendationStatus::Approved,
            'approved_by'  => $admin->id,
            'approved_at'  => now(),
            'generated_at' => now(),
            'pdf_path'     => $pdfPath,
        ]);

        return $letter->fresh(['user', 'internship', 'approvedBy']);
    }

    /**
     * Admin rejects a recommendation letter request.
     *
     * @throws ModelNotFoundException
     * @throws ValidationException
     */
    public function rejectLetter(int $letterId, User $admin, ?string $notes = null): RecommendationLetter
    {
        $letter = RecommendationLetter::findOrFail($letterId);

        if (!$letter->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending letters can be rejected.'],
            ]);
        }

        $letter->update([
            'status'      => RecommendationStatus::Rejected,
            'approved_by' => $admin->id,
            'admin_notes' => $notes,
        ]);

        return $letter->fresh();
    }

    /**
     * Get all recommendation letters.
     * Admins see all. Intern scope handled in controller.
     */
    public function getAllLetters(array $filters = [], ?User $scopeToUser = null)
    {
        return RecommendationLetter::with(['user', 'internship', 'approvedBy'])
            ->when($scopeToUser, fn($q) => $q->where('user_id', $scopeToUser->id))
            ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
            ->latest()
            ->get();
    }

    /**
     * Get a single recommendation letter by ID.
     *
     * @throws ModelNotFoundException
     */
    public function getLetterById(int $id): RecommendationLetter
    {
        return RecommendationLetter::with(['user', 'internship', 'approvedBy'])
            ->findOrFail($id);
    }

    /**
     * Translate achievement keys to professional language
     * suitable for a formal recommendation letter.
     *
     * Achievement badge names like "Fast Finisher" are informal.
     * We translate them to professional descriptions before
     * including them in the letter.
     */
    private function translateAchievements(\Illuminate\Support\Collection $achievements): array    {
        $translations = [
            'perfect_attendance'   => 'demonstrated exceptional attendance and commitment throughout the internship period',
            'fast_finisher'        => 'consistently delivered work ahead of schedule, demonstrating strong time management skills',
            'thirty_day_streak'    => 'maintained consistent daily documentation over an extended period',
            'team_player'          => 'contributed meaningfully across multiple projects simultaneously',
            'top_performer'        => 'achieved outstanding overall performance scores across all evaluation dimensions',
            'milestone_master'     => 'consistently completed project milestones ahead of schedule',
            'consistency_champion' => 'maintained exceptional consistency in work documentation throughout the internship',
        ];

        return $achievements->map(function ($achievement) use ($translations) {
            return [
                'key'                 => $achievement->key,
                'name'                => $achievement->name,
                'professional_phrase' => $translations[$achievement->key]
                    ?? $achievement->description,
            ];
        })->toArray();
    }
}