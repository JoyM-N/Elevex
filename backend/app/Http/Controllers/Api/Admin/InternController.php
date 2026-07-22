<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Minimal intern directory for admin pickers (e.g. project members).
 */
class InternController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/admin/interns
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', 'intern')
            ->where('is_active', true)
            ->orderBy('name');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $interns = $query->paginate($request->integer('per_page', 50));

        return $this->paginated(
            UserResource::collection($interns),
            'Interns retrieved successfully.'
        );
    }
}
