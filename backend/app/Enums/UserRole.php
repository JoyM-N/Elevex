<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Admin      = 'admin';
    case Intern     = 'intern';

    public function label(): string
    {
        return match($this) {
            UserRole::SuperAdmin => 'Super Admin',
            UserRole::Admin      => 'Admin',
            UserRole::Intern     => 'Intern',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}