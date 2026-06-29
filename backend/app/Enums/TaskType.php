<?php

namespace App\Enums;

enum TaskType: string
{
    case ProjectTask = 'project_task';
    case GeneralTask = 'general_task';

    public function label(): string
    {
        return match($this) {
            self::ProjectTask => 'Project Task',
            self::GeneralTask => 'General Task',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
