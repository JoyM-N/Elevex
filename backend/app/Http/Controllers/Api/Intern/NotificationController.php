<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\NotificationResource;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * NotificationController (Intern)
 *
 * Interns can view and manage their own notifications.
 * Same structure as admin — scoped to authenticated user.
 */
class NotificationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * GET /api/v1/intern/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getNotifications($request->user());

        return $this->paginated(
            NotificationResource::collection($notifications),
            'Notifications retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/intern/notifications/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return $this->success(
            ['count' => $this->notificationService->getUnreadCount($request->user())],
            'Unread count retrieved.'
        );
    }

    /**
     * PATCH /api/v1/intern/notifications/{id}/read
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->notificationService->markAsRead($request->user(), $id);

        return $this->success(message: 'Notification marked as read.');
    }

    /**
     * PATCH /api/v1/intern/notifications/read-all
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return $this->success(message: 'All notifications marked as read.');
    }
}