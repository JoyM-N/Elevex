<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

/**
 * NotificationService
 *
 * Manages reading and marking notifications for users.
 *
 * Sending notifications is done directly in the calling
 * service (LogbookService, TaskService etc.) using
 * $user->notify(new SomeNotification()).
 *
 * This service handles the READ side:
 *   - Listing notifications
 *   - Marking as read
 *   - Unread count
 */
class NotificationService
{
    /**
     * Get all notifications for a user.
     * Most recent first.
     */
    public function getNotifications(User $user, int $perPage = 20)
    {
        return $user->notifications()->latest()->paginate($perPage);
    }

    /**
     * Get only unread notifications for a user.
     */
    public function getUnreadNotifications(User $user): Collection
    {
        return $user->unreadNotifications()->get();
    }

    /**
     * Get unread notification count.
     * Used for the notification badge in the UI.
     */
    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    /**
     * Mark a specific notification as read.
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function markAsRead(User $user, string $notificationId): void
    {
        $notification = $user->notifications()->findOrFail($notificationId);
        $notification->markAsRead();
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }
}