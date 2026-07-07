<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
/**
 * User Model
 *
 * The central model of Elevex. Every person in the system is a User.
 * Their role determines what they can see and do.
 *
 * Roles:
 *   super_admin — manages the entire system
 *   admin       — manages projects, interns, evaluations
 *   intern      — works on tasks, submits logbooks
 *
 * SoftDeletes:
 *   Users are never hard deleted. Deleting a user would orphan
 *   projects, logbooks, evaluations and historical records.
 *   Soft delete preserves all that data.
 *
 * MustVerifyEmail:
 *   Forces email verification before the user can access the system.
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes;
    /**
     * The columns that are mass assignable.
     * These are the only columns that can be set via create() or update().
     * This protects against mass assignment vulnerabilities.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar_path',
        'is_active',
    ];

    /**
     * The columns that should never be included in API responses or arrays.
     * Password and remember_token should never leave the server.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Column type casting.
     * Laravel automatically converts these columns to the specified types
     * when you access them on the model.
     *
     * role => UserRole::class means $user->role returns a UserRole enum
     * instead of a plain string. This gives us type safety.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',  // auto hashes on assignment
            'role'              => UserRole::class,
            'is_active'         => 'boolean',
        ];
    }

    // =========================================================
    // Role Helper Methods
    //
    // These clean boolean checks are used in Policies and Controllers.
    // Much more readable than: $user->role === UserRole::Admin
    // =========================================================

    /**
     * Check if this user is a Super Admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === UserRole::SuperAdmin;
    }

    /**
     * Check if this user is an Admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * Check if this user is an Intern.
     */
    public function isIntern(): bool
    {
        return $this->role === UserRole::Intern;
    }

    /**
     * Check if this user is Admin level or above.
     * Used when both Super Admin and Admin can perform an action.
     */
    public function isAdminOrAbove(): bool
    {
        return in_array($this->role, [UserRole::SuperAdmin, UserRole::Admin]);
    }

    // =========================================================
    // Relationships
    // =========================================================

    /**
     * All internships this user has had over time.
     * One user can have multiple internships historically.
     */
    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class);
    }

    /**
     * The most recent internship for this user.
     * Used on dashboards where we only need current context.
     */
    public function activeInternship(): HasOne
    {
        return $this->hasOne(Internship::class)->latestOfMany();
    }

    /**
     * All internships where this user is the supervisor.
     * Admins supervise interns — this gets their supervisees.
     */
    public function supervisedInternships(): HasMany
    {
        return $this->hasMany(Internship::class, 'supervisor_id');
    }

    /**
     * Projects this user is a member of.
     * The pivot table carries the team_role for each project.
     */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
            ->withPivot('team_role')
            ->withTimestamps();
    }

    /**
     * Projects created by this user (admin).
     */
    public function createdProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    /**
     * Tasks assigned to this user (intern).
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Tasks created by this user (admin).
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Daily logbook entries submitted by this user (intern).
     */
    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class);
    }

    /**
     * Evaluations received by this user (intern being evaluated).
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }

    /**
     * Evaluations written by this user (admin evaluating interns).
     */
    public function writtenEvaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'evaluated_by');
    }

    /**
     * Performance metric records for this user.
     * One record per internship period.
     */
    public function performanceMetrics(): HasMany
    {
        return $this->hasMany(PerformanceMetric::class);
    }

    /**
     * Recommendation letters requested by or for this user.
     */
    public function recommendationLetters(): HasMany
    {
        return $this->hasMany(RecommendationLetter::class);
    }

    /**
     * Skills this user has, with proficiency levels.
     * The pivot table carries proficiency_level and endorsement info.
     */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'user_skills')
            ->withPivot(['proficiency_level', 'endorsed_by', 'endorsed_at'])
            ->withTimestamps();
    }

    /**
     * Achievements this user has earned.
     * The pivot table carries when it was awarded.
     */
    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('awarded_at')
            ->withTimestamps();
    }

    /**
     * Activity log entries for this user.
     * Every significant action they perform is recorded here.
     */
    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Comments made by this user.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Files uploaded by this user.
     */
    public function fileUploads(): HasMany
    {
        return $this->hasMany(FileUpload::class);
    }
}