<?php

namespace App\Enums;

enum LogbookStatus: string
{
    case Draft          = 'draft';
    case Submitted      = 'submitted';
    case Approved       = 'approved';
    case Rejected       = 'rejected';
    case RevisionNeeded = 'revision_needed';

    public function label(): string
    {
        return match($this) {
            self::Draft          => 'Draft',
            self::Submitted      => 'Submitted',
            self::Approved       => 'Approved',
            self::Rejected       => 'Rejected',
            self::RevisionNeeded => 'Revision Needed',
        };
    }

    public function isLocked(): bool
    {
        return $this === self::Approved;
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}