<?php

namespace App\Services;

use App\Models\SickDay;
use App\Models\User;
use App\Notifications\SickDayStatusChanged;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

/**
 * SickDayService
 *
 * Manages intern sick day requests and admin approvals.
 *
 * Approved sick days are excluded from:
 *   PerfectAttendanceRule — achievement check
 *   PerformanceService    — consistency score calculation
 *
 * Both of these already read from the sick_days table
 * so approval here automatically affects those calculations
 * on the next scheduler run or manual recalculation.
 */
class SickDayService
{
    /**
     * Get all sick days.
     * Optionally scoped to a specific intern.
     */
    public function getAllSickDays(
        array $filters = [],
        ?User $scopeToUser = null
    ): LengthAwarePaginator {
        return SickDay::with(['user', 'approvedBy'])
            ->when($scopeToUser, fn($q) => $q->where('user_id', $scopeToUser->id))
            ->when(isset($filters['status']), fn($q) => $q->where('status', $filters['status']))
            ->latest('date')
            ->paginate(15);
    }

    /**
     * Intern submits a sick day request.
     *
     * @throws ValidationException if already submitted for this date
     */
    public function requestSickDay(User $intern, array $data): SickDay
    {
        // One sick day request per intern per date
        $exists = SickDay::where('user_id', $intern->id)
            ->where('date', $data['date'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'date' => ['You have already submitted a sick day request for this date.'],
            ]);
        }

        return SickDay::create([
            ...$data,
            'user_id' => $intern->id,
            'status'  => 'pending',
        ]);
    }

    /**
     * Admin approves a sick day request.
     * Sends notification to the intern via queue.
     *
     * @throws ModelNotFoundException
     * @throws ValidationException
     */
    public function approveSickDay(int $id, User $admin, ?string $notes = null): SickDay
    {
        $sickDay = SickDay::with('user')->findOrFail($id);

        if ($sickDay->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Only pending sick day requests can be approved.'],
            ]);
        }

        $sickDay->update([
            'status'      => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $notes,
        ]);

        // Notify intern — queued via Redis
        $sickDay->user->notify(new SickDayStatusChanged($sickDay, 'approved'));

        return $sickDay->fresh();
    }

    /**
     * Admin rejects a sick day request.
     * Sends notification to the intern via queue.
     *
     * @throws ModelNotFoundException
     * @throws ValidationException
     */
    public function rejectSickDay(int $id, User $admin, ?string $notes = null): SickDay
    {
        $sickDay = SickDay::with('user')->findOrFail($id);

        if ($sickDay->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Only pending sick day requests can be rejected.'],
            ]);
        }

        $sickDay->update([
            'status'      => 'rejected',
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'admin_notes' => $notes,
        ]);

        // Notify intern — queued via Redis
        $sickDay->user->notify(new SickDayStatusChanged($sickDay, 'rejected'));

        return $sickDay->fresh();
    }
}