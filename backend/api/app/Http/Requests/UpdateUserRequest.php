<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\User;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'role' => 'required|string|in:Visiter,Standard,Premium',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'Имя должно быть строкой',
            'name.max' => 'Имя не должно превышать 255 символов',
            'role.required' => 'Роль обязательна для заполнения',
            'role.string' => 'Роль должна быть строкой',
            'role.in' => 'Роль должна быть одной из: Visiter, Standard, Premium',
        ];
    }
}

