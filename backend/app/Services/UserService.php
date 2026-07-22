<?php

namespace App\Services;

use App\Enums\InternshipStatus;
use App\Enums\UserRole;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * UserService
 *
 * Handles admin/intern account creation, profile updates, and avatars.
 */
class UserService
{
    /**
     * List admin users (role = admin), optionally filtered by search.
     */
    public function getAdmins(array $filters = [], int $perPage = 20)
    {
        return User::query()
            ->where('role', UserRole::Admin)
            ->when(
                !empty($filters['search']),
                function ($q) use ($filters) {
                    $search = $filters['search'];
                    $q->where(function ($inner) use ($search) {
                        $inner->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }
            )
            ->when(
                array_key_exists('is_active', $filters) && $filters['is_active'] !== null && $filters['is_active'] !== '',
                fn ($q) => $q->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN))
            )
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Create a new admin account. Super-admin only (enforced in FormRequest).
     */
    public function createAdmin(array $data): User
    {
        return User::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'password'          => $data['password'],
            'phone'             => $data['phone'] ?? null,
            'role'              => UserRole::Admin,
            'is_active'         => $data['is_active'] ?? true,
            'email_verified_at' => now(),
        ]);
    }

    /**
     * List interns with optional search / active filters.
     */
    public function getInterns(array $filters = [], int $perPage = 50)
    {
        $query = User::query()
            ->where('role', UserRole::Intern)
            ->with(['activeInternship.supervisor'])
            ->orderBy('name');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (array_key_exists('is_active', $filters) && $filters['is_active'] !== null && $filters['is_active'] !== '') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        } else {
            // Default: active only (keeps project-member pickers working)
            $query->where('is_active', true);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get a single intern with internship history.
     */
    public function getInternById(int $id): User
    {
        $intern = User::query()
            ->where('role', UserRole::Intern)
            ->with([
                'activeInternship.supervisor',
                'internships.supervisor',
            ])
            ->findOrFail($id);

        return $intern;
    }

    /**
     * Onboard a new intern: create user + active internship in one transaction.
     */
    public function onboardIntern(array $data, User $actingAdmin): User
    {
        return DB::transaction(function () use ($data, $actingAdmin) {
            $intern = User::create([
                'name'              => $data['name'],
                'email'             => $data['email'],
                'password'          => $data['password'],
                'phone'             => $data['phone'] ?? null,
                'role'              => UserRole::Intern,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]);

            $supervisorId = $data['supervisor_id'] ?? $actingAdmin->id;

            $supervisor = User::findOrFail($supervisorId);
            if (!$supervisor->isAdminOrAbove()) {
                throw ValidationException::withMessages([
                    'supervisor_id' => ['Supervisor must be an admin.'],
                ]);
            }

            Internship::create([
                'user_id'       => $intern->id,
                'supervisor_id' => $supervisor->id,
                'department'    => $data['department'],
                'university'    => $data['university'] ?? null,
                'student_id'    => $data['student_id'] ?? null,
                'start_date'    => $data['start_date'],
                'end_date'      => $data['end_date'],
                'status'        => InternshipStatus::Active,
                'notes'         => $data['notes'] ?? null,
            ]);

            return $intern->load(['activeInternship.supervisor', 'internships.supervisor']);
        });
    }

    /**
     * Update profile fields the user is allowed to change (name, phone).
     */
    public function updateProfile(User $user, array $data): User
    {
        $payload = [];

        if (array_key_exists('name', $data)) {
            $payload['name'] = $data['name'];
        }

        if (array_key_exists('phone', $data)) {
            $payload['phone'] = $data['phone'];
        }

        if ($payload !== []) {
            $user->update($payload);
        }

        return $user->fresh()->loadMissing('activeInternship');
    }

    /**
     * Store avatar image and update avatar_path. Replaces previous file.
     */
    public function uploadAvatar(User $user, UploadedFile $file): User
    {
        $disk = 'public';
        $storedName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('avatars', $storedName, $disk);

        if ($user->avatar_path) {
            Storage::disk($disk)->delete($user->avatar_path);
        }

        $user->update(['avatar_path' => $path]);

        return $user->fresh()->loadMissing('activeInternship');
    }
}
