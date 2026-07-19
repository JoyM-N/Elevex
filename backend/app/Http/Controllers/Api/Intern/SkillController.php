<?php

namespace App\Http\Controllers\Api\Intern;

use App\Http\Controllers\Controller;
use App\Http\Requests\Skill\AssignSkillRequest;
use App\Http\Resources\V1\SkillResource;
use App\Services\SkillService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SkillController (Intern)
 *
 * Interns can view all available skills,
 * view their own skills, and assign skills to themselves.
 */
class SkillController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly SkillService $skillService
    ) {}

    /**
     * GET /api/v1/intern/skills
     * List all available skills to choose from.
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
     * GET /api/v1/intern/skills/mine
     * View own assigned skills with proficiency levels.
     */
    public function mine(Request $request): JsonResponse
    {
        $skills = $this->skillService->getInternSkills($request->user());

        return $this->success(
            SkillResource::collection($skills),
            'Your skills retrieved successfully.'
        );
    }

    /**
     * POST /api/v1/intern/skills
     * Assign a skill to yourself with a proficiency level.
     */
    public function assign(AssignSkillRequest $request): JsonResponse
    {
        $this->skillService->assignSkill(
            intern: $request->user(),
            skillId: $request->validated('skill_id'),
            proficiencyLevel: $request->validated('proficiency_level')
        );

        return $this->success(message: 'Skill assigned successfully.');
    }

    /**
     * DELETE /api/v1/intern/skills/{skill}
     * Remove a skill from your profile.
     */
    public function remove(Request $request, int $skillId): JsonResponse
    {
        $this->skillService->removeSkill($request->user(), $skillId);

        return $this->noContent('Skill removed successfully.');
    }
}