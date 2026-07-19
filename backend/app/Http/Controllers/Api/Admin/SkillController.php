<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Skill\AssignSkillRequest;
use App\Http\Requests\Skill\EndorseSkillRequest;
use App\Http\Resources\V1\SkillResource;
use App\Models\User;
use App\Services\SkillService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SkillController (Admin)
 *
 * Admins can view intern skills and endorse proficiency levels.
 */
class SkillController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SkillService $skillService
    ) {}

    /**
     * GET /api/v1/admin/skills
     * List all available skills in the system.
     */
    public function index(Request $request): JsonResponse
    {
        $skills = $this->skillService->getAllSkills();

        return $this->success(
            SkillResource::collection($skills),
            'Skills retrieved successfully.'
        );
    }

    /**
     * GET /api/v1/admin/interns/{user}/skills
     * View all skills for a specific intern.
     */
    public function internSkills(Request $request, int $userId): JsonResponse
    {
        $intern = User::findOrFail($userId);
        $skills = $this->skillService->getInternSkills($intern);

        return $this->success(
            SkillResource::collection($skills),
            'Intern skills retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/admin/interns/{user}/skills/endorse
     * Admin endorses an intern's skill proficiency.
     */
    public function endorse(EndorseSkillRequest $request, int $userId): JsonResponse
    {
        $intern = User::findOrFail($userId);

        $this->skillService->endorseSkill(
            intern: $intern,
            skillId: $request->validated('skill_id'),
            admin: $request->user()
        );

        return $this->success(
            message: 'Skill endorsed successfully.'
        );
    }
}