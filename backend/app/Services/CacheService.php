<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

/**
 * CacheService
 *
 * Centralized cache key management for Elevex.
 *
 * Why centralize cache keys?
 * If cache keys are scattered across controllers and services,
 * invalidating the right cache when data changes becomes
 * impossible to maintain. This service owns all keys.
 *
 * Cache driver: Redis (configured in .env CACHE_STORE=redis)
 *
 * TTL strategy:
 *   Dashboard data  — 5 minutes (changes frequently)
 *   Performance metrics — 30 minutes (recalculated nightly)
 *   Skills list     — 60 minutes (rarely changes)
 *   Public holidays — 24 hours (almost never changes)
 */
class CacheService
{
    /**
     * Get or cache the admin dashboard data.
     *
     * @param callable $callback Function that generates the data
     */
    public function adminDashboard(callable $callback): mixed
    {
        return Cache::remember('dashboard:admin', now()->addMinutes(5), $callback);
    }

    /**
     * Get or cache a specific intern's dashboard data.
     */
    public function internDashboard(int $userId, callable $callback): mixed
    {
        return Cache::remember(
            "dashboard:intern:{$userId}",
            now()->addMinutes(5),
            $callback
        );
    }

    /**
     * Get or cache performance metrics for a specific intern.
     */
    public function performanceMetrics(int $userId, callable $callback): mixed
    {
        return Cache::remember(
            "performance:user:{$userId}",
            now()->addMinutes(30),
            $callback
        );
    }

    /**
     * Get or cache the skills list.
     * Skills rarely change so we cache for 60 minutes.
     */
    public function skillsList(callable $callback): mixed
    {
        return Cache::remember('skills:all', now()->addMinutes(60), $callback);
    }

    /**
     * Get or cache public holidays for a given year.
     */
    public function publicHolidays(int $year, callable $callback): mixed
    {
        return Cache::remember(
            "holidays:{$year}",
            now()->addHours(24),
            $callback
        );
    }

    /**
     * Invalidate admin dashboard cache.
     * Called when any data that affects the dashboard changes.
     */
    public function invalidateAdminDashboard(): void
    {
        Cache::forget('dashboard:admin');
    }

    /**
     * Invalidate a specific intern's dashboard cache.
     * Called when their tasks, logbooks, or metrics change.
     */
    public function invalidateInternDashboard(int $userId): void
    {
        Cache::forget("dashboard:intern:{$userId}");
    }

    /**
     * Invalidate performance metrics cache for a specific intern.
     * Called after PerformanceService recalculates.
     */
    public function invalidatePerformanceMetrics(int $userId): void
    {
        Cache::forget("performance:user:{$userId}");
    }

    /**
     * Invalidate skills list cache.
     * Called when a skill is added or removed.
     */
    public function invalidateSkillsList(): void
    {
        Cache::forget('skills:all');
    }

    /**
     * Invalidate public holidays cache for a year.
     * Called when a holiday is added, updated, or removed.
     */
    public function invalidatePublicHolidays(int $year): void
    {
        Cache::forget("holidays:{$year}");
    }
}