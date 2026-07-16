<?php

namespace App\Http\Requests\Logbook;

use App\Models\Logbook;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * ReviewLogbookRequest
 *
 * Validates when an admin approves, rejects, or requests
 * revision on a submitted logbook.
 *
 * action: what the admin is doing
 *   approved         — logbook is good, permanently locked
 *   rejected         — logbook is rejected, intern notified
 *   revision_needed  — admin wants changes before approving
 *
 * revision_note: required when rejecting or requesting revision
 *   so the intern knows what to fix
 */
class ReviewLogbookRequest extends FormRequest
{
    public function authorize(): bool
    {
        $logbook = $this->route('logbook');

        $logbook = $logbook instanceof Logbook
            ? $logbook
            : Logbook::query()->findOrFail($logbook);

        return $this->user()->can('review', $logbook);
    }

    public function rules(): array
    {
        return [
            'action' => [
                'required',
                Rule::in(['approved', 'rejected', 'revision_needed']),
            ],

            // revision_note is required when rejecting or requesting revision
            // so the intern knows what needs to change
            'revision_note' => [
                Rule::requiredIf(fn() => in_array(
                    $this->action,
                    ['rejected', 'revision_needed']
                )),
                'nullable',
                'string',
                'min:10',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'revision_note.required' => 'Please provide feedback explaining what needs to change.',
            'revision_note.min'      => 'Feedback must be at least 10 characters.',
        ];
    }
}