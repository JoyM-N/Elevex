<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Logbook\ReviewLogbookRequest;
use App\Http\Resources\V1\CommentResource;
use App\Http\Resources\V1\LogbookResource;
use App\Models\Logbook;
use App\Services\LogbookService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Admin LogbookController
 *
 * Admins can:
 *   - View all logbooks across all interns
 *   - Review (approve/reject/request revision) submitted logbooks
 *   - Comment on logbooks
 */
class LogbookController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly LogbookService $logbookService
    ) {}

    /**
     * GET /api/v1/admin/logbooks
     * List all logbooks with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $logbooks = $this->logbookService->getAllLogbooks(
            filters: $request->only(['status', 'task_id', 'date']),
            perPage: $request->integer('per_page', 15)
            // No scopeToUser — admins see all logbooks
        );

        return $this->paginated(
            LogbookResource::collection($logbooks),
            'Logbooks retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/admin/logbooks/{logbook}
     * View a single logbook with all details.
     */
    public function show(Request $request, Logbook $logbook): JsonResponse
    {
        $this->authorize('view', $logbook);

        $logbook->load(['user', 'task', 'approvedBy', 'comments.user', 'fileUploads']);

        return $this->success(
            new LogbookResource($logbook),
            'Logbook retrieved successfully.'
        );
    }

    /**
     * PATCH /api/v1/admin/logbooks/{logbook}/review
     * Approve, reject, or request revision on a logbook.
     */
    public function review(ReviewLogbookRequest $request, Logbook $logbook): JsonResponse
    {
        $logbook = $this->logbookService->reviewLogbook(
            id: $logbook->id,
            action: $request->validated('action'),
            admin: $request->user(),
            revisionNote: $request->validated('revision_note')
        );

        $message = match($request->validated('action')) {
            'approved'        => 'Logbook approved successfully.',
            'rejected'        => 'Logbook rejected.',
            'revision_needed' => 'Revision requested.',
        };

        return $this->success(
            new LogbookResource($logbook),
            $message
        );
    }

    /**
     * POST /api/v1/admin/logbooks/{logbook}/comments
     * Admin adds a comment to a logbook.
     */
    public function addComment(Request $request, Logbook $logbook): JsonResponse
    {
        $request->validate([
            'body' => ['required', 'string', 'min:2'],
        ]);

        $comment = $this->logbookService->addComment(
            logbookId: $logbook->id,
            body: $request->body,
            user: $request->user()
        );

        return $this->created(
            new CommentResource($comment->load('user')),
            'Comment added successfully.'
        );
    }
}