<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetForecastDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'article' => 'required|string',
            'brand' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'article.required' => 'Артикул обязателен для заполнения',
            'article.string' => 'Артикул должен быть строкой',
            'brand.required' => 'Бренд обязателен для заполнения',
            'brand.string' => 'Бренд должен быть строкой',
        ];
    }
}

