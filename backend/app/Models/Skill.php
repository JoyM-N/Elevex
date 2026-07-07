<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
    ];

    public function isTechnical(): bool
    {
        return $this->category === 'technical';
    }

    
    public function isSoft(): bool
    {
        return $this->category === 'soft';
    }


    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_skills')
            ->withPivot(['proficiency_level', 'endorsed_by', 'endorsed_at'])
            ->withTimestamps();
    }
}