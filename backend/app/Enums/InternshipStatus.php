<?php

namespace App\Enums;

enum InternshipStatus: string
{
    case Active     = 'active';
    case Completed  = 'completed';
    case Terminated = 'terminated';
    case Archived   = 'archived';

    public function label(): string
    {
        return match($this) {
            self::Active     => 'Active',
            self::Completed  => 'Completed',
            self::Terminated => 'Terminated',
            self::Archived   => 'Archived',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
