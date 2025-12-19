<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string|size:32',
            'password' => 'required|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email обязателен для заполнения',
            'email.email' => 'Введите корректный email',
            'email.exists' => 'Пользователь с таким email не найден',
            'token.required' => 'Токен обязателен для заполнения',
            'token.string' => 'Токен должен быть строкой',
            'token.size' => 'Токен должен содержать 32 символа',
            'password.required' => 'Пароль обязателен для заполнения',
            'password.min' => 'Пароль должен содержать минимум 8 символов',
            'password.confirmed' => 'Пароли не совпадают',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => $this->query('email'),
            'token' => $this->query('token'),
        ]);
    }
}
