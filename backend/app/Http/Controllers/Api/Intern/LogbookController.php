<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Requests\Logbook\StoreLogbookRequest;
use App\Http\Requests\Logbook\UpdateLogbookRequest;
use App\Http\Resources\V1\LogbookResource;
use App\Http\Resources\V1\CommentResource;
use App\Models\Logbook;
use App\Services\FileUploadService;
use App\Services\LogbookService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Intern LogbookController
 *
 * Interns can:
 *   - Create logbook entries
 *   - View their own logbooks
 *   - Update draft/revision_needed logbooks
 *   - Submit logbooks for review
 *   - Upload files to logbooks
 *   - Comment on logbooks
 *   - Delete draft logbooks
 */
class LogbookController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly LogbookService $logbookService,
        private readonly FileUploadService $fileUploadService
    ) {}

    /**
     * GET /api/v1/intern/logbooks
     * List logbooks belonging to the authenticated intern.
     */
    public function index(Request $request): JsonResponse
    {
        $logbooks = $this->logbookService->getAllLogbooks(
            filters: $request->only(['status', 'task_id', 'date']),
            perPage: $request->integer('per_page', 15),
            scopeToUser: $request->user()
        );

        return $this->paginated(
            LogbookResource::collection($logbooks),
            'Logbooks retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/intern/logbooks
     * Create a new logbook entry.
     */
    public function store(StoreLogbookRequest $request): JsonResponse
    {
        $logbook = $this->logbookService->createLogbook(
            data: $request->validated(),
            intern: $request->user()
        );

        return $this->created(
            new LogbookResource($logbook),
            'Logbook entry created successfully.'
        );
    }

    /**
     * GET /api/v1/intern/logbooks/{logbook}
     * View a single logbook entry.
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
     * PUT /api/v1/intern/logbooks/{logbook}
     * Update a draft or revision_needed logbook.
     */
    public function update(UpdateLogbookRequest $request, Logbook $logbook): JsonResponse
    {
        $logbook = $this->logbookService->updateLogbook(
            id: $logbook->id,
            data: $request->validated()
        );

        return $this->success(
            new LogbookResource($logbook),
            'Logbook updated successfully.'
        );
    }

    /**
     * PATCH /api/v1/intern/logbooks/{logbook}/submit
     * Submit a logbook for admin review.
     */
    public function submit(Request $request, Logbook $logbook): JsonResponse
    {
        $this->authorize('submit', $logbook);

        $logbook = $this->logbookService->submitLogbook($logbook->id, $request->user());

        return $this->success(
            new LogbookResource($logbook),
            'Logbook submitted for review.'
        );
    }

    /**
     * DELETE /api/v1/intern/logbooks/{logbook}
     * Delete a draft logbook entry.
     */
    public function destroy(Request $request, Logbook $logbook): JsonResponse
    {
        $this->authorize('delete', $logbook);

        $this->logbookService->deleteLogbook($logbook->id);

        return $this->noContent('Logbook deleted successfully.');
    }

    /**
     * POST /api/v1/intern/logbooks/{logbook}/files
     * Upload proof of work files to a logbook.
     */
    public function uploadFile(Request $request, Logbook $logbook): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf,doc,docx'],
        ]);

        $this->authorize('update', $logbook);

        $fileUpload = $this->fileUploadService->store(
            file: $request->file('file'),
            user: $request->user(),
            model: $logbook,
            folder: 'logbooks'
        );

        return $this->created(
            new \App\Http\Resources\V1\FileUploadResource($fileUpload),
            'File uploaded successfully.'
        );
    }

    /**
     * POST /api/v1/intern/logbooks/{logbook}/comments
     * Add a comment to a logbook.
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