<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => 'required|string|size:32',
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'Токен обязателен для заполнения',
            'token.string' => 'Токен должен быть строкой',
            'token.size' => 'Токен должен содержать 32 символа',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'token' => $this->query('token'),
        ]);
    }
}
