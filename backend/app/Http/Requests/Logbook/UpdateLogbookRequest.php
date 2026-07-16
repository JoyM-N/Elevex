<?php

namespace App\Http\Requests\Logbook;

use App\Models\Logbook;
use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateLogbookRequest
 *
 * Validates when an intern updates a draft or revision_needed logbook.
 *
 * Critical rule:
 *   Approved logbooks cannot be updated — enforced in LogbookPolicy.
 *   The policy runs in authorize() before these rules even execute.
 */
class UpdateLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        // LogbookPolicy@update checks:
        // 1. Is the logbook approved? If yes → false (immutable)
        // 2. Does this intern own this logbook? If no → false
        return $this->user()->can('update', $this->resolveLogbook());
    }

    protected function resolveLogbook(): Logbook
    {
        $logbook = $this->route('logbook');

        return $logbook instanceof Logbook
            ? $logbook
            : Logbook::query()->findOrFail($logbook);
    }

    public function rules(): array
    {
        return [
            'date'             => ['sometimes', 'date', 'before_or_equal:today'],
            'hours_worked'     => ['sometimes', 'numeric', 'min:0.5', 'max:24'],
            'description'      => ['sometimes', 'string', 'min:10'],
            'blockers'         => ['nullable', 'string'],
            'learning_outcome' => ['nullable', 'string'],
        ];
    }
}