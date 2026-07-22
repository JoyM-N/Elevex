<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Logbook\ReviewLogbookRequest;
use App\Http\Resources\V1\CommentResource;
use App\Http\Resources\V1\LogbookResource;
use App\Http\Resources\V1\LogbookSignoffResource;
use App\Models\Logbook;
use App\Models\User;
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
            filters: $request->only(['status', 'task_id', 'date', 'user_id']),
            perPage: $request->integer('per_page', 15)
            // No scopeToUser — admins see all logbooks
        );

        return $this->paginated(
            LogbookResource::collection($logbooks),
            'Logbooks retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/admin/logbooks/interns
     * Interns who have logbook entries, with counts for the admin index.
     */
    public function interns(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Logbook::class);

        $interns = $this->logbookService->getInternLogbookSummaries(
            perPage: $request->integer('per_page', 20)
        );

        $data = $interns->getCollection()->map(function (User $intern) {
            return [
                'id'             => $intern->id,
                'name'           => $intern->name,
                'email'          => $intern->email,
                'entries_count'  => (int) $intern->entries_count,
                'pending_count'  => (int) $intern->pending_count,
                'approved_count' => (int) $intern->approved_count,
                'revision_count' => (int) $intern->revision_count,
                'draft_count'    => (int) $intern->draft_count,
                'total_hours'    => round((float) ($intern->total_hours ?? 0), 2),
                'is_finalized'   => $intern->logbookSignoff !== null,
                'signoff'        => $intern->logbookSignoff
                    ? (new LogbookSignoffResource($intern->logbookSignoff))->resolve()
                    : null,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'message' => 'Intern logbooks retrieved successfully.',
            'data'    => $data,
            'meta'    => [
                'current_page' => $interns->currentPage(),
                'last_page'    => $interns->lastPage(),
                'per_page'     => $interns->perPage(),
                'total'        => $interns->total(),
            ],
        ]);
    }

    /**
     * POST /api/v1/admin/logbooks/interns/{user}/finalize
     * Sign off the intern's overall logbook after entry-level reviews.
     */
    public function finalize(Request $request, User $user): JsonResponse
    {
        $this->authorize('viewAny', Logbook::class);

        $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $signoff = $this->logbookService->finalizeInternLogbook(
            intern: $user,
            admin: $request->user(),
            note: $request->input('note')
        );

        return $this->success(
            new LogbookSignoffResource($signoff),
            'Intern logbook finalized successfully.'
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