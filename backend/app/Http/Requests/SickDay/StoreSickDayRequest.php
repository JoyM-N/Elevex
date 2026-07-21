<?php

namespace App\Http\Requests\SickDay;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreSickDayRequest
 *
 * Validates when an intern submits a sick day request.
 * Date cannot be in the future — you can only report
 * sick days that have already occurred or are today.
 */
class StoreSickDayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isIntern();
    }

    public function rules(): array
    {
        return [
            'date'   => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.before_or_equal' => 'You can only report sick days for today or past dates.',
        ];
    }
}