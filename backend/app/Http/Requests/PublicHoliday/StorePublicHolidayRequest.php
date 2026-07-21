<?php

namespace App\Http\Requests\PublicHoliday;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StorePublicHolidayRequest
 *
 * Validates when an admin creates a public holiday.
 * Date must be unique — no two holidays on the same date.
 */
class StorePublicHolidayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdminOrAbove();
    }

    public function rules(): array
    {
        return [
            'date'    => ['required', 'date', 'unique:public_holidays,date'],
            'name'    => ['required', 'string', 'max:255'],
            'country' => ['sometimes', 'string', 'size:2'],
        ];
    }
}