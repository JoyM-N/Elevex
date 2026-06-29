<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Todo       = 'todo';
    case InProgress = 'in_progress';
    case InReview   = 'in_review';
    case Completed  = 'completed';
    case Blocked    = 'blocked';
    case Cancelled  = 'cancelled';

    public function label(): string
    {
        return match($this) {
            self::Todo       => 'To Do',
            self::InProgress => 'In Progress',
            self::InReview   => 'In Review',
            self::Completed  => 'Completed',
            self::Blocked    => 'Blocked',
            self::Cancelled  => 'Cancelled',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled]);
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
