<?php

namespace App\Enums;

enum TeamRole: string
{
    case Frontend      = 'frontend';
    case Backend       = 'backend';
    case FullStack     = 'full_stack';
    case DevOps        = 'devops';
    case Design        = 'design';
    case QA            = 'qa';
    case Documentation = 'documentation';
    case Solo          = 'solo';

    public function label(): string
    {
        return match($this) {
            self::Frontend      => 'Frontend',
            self::Backend       => 'Backend',
            self::FullStack     => 'Full Stack',
            self::DevOps        => 'DevOps',
            self::Design        => 'Design',
            self::QA            => 'QA',
            self::Documentation => 'Documentation',
            self::Solo          => 'Solo',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}