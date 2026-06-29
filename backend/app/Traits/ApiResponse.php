<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{

    protected function success(
        mixed $data = null,
        string $message = 'Operation successful.',
        int $statusCode = 200
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $payload['data'] = $data instanceof JsonResource || $data instanceof ResourceCollection
                ? $data->resolve()
                : $data;
        }

        return response()->json($payload, $statusCode);
    }

    protected function created(
        mixed $data = null,
        string $message = 'Resource created successfully.'
    ): JsonResponse {
        return $this->success($data, $message, 201);
    }

    protected function paginated(
        ResourceCollection $collection,
        string $message = 'Resources retrieved successfully.'
    ): JsonResponse {
        $paginator = $collection->resource;

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $collection->resolve(),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ], 200);
    }

    protected function noContent(
        string $message = 'Resource deleted successfully.'
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
        ], 200);
    }

    protected function forbidden(
        string $message = 'You do not have permission to perform this action.'
    ): JsonResponse {
        return $this->error($message, 403);
    }

    protected function notFound(
        string $message = 'Resource not found.'
    ): JsonResponse {
        return $this->error($message, 404);
    }

    protected function unauthorized(
        string $message = 'Unauthenticated.'
    ): JsonResponse {
        return $this->error($message, 401);
    }

    protected function error(
        string $message,
        int $statusCode = 500
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
        ], $statusCode);
    }
}