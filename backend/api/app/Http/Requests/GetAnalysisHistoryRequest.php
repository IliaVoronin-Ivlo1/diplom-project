<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GetAnalysisHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'status' => 'nullable|string|in:IN_PROCESS,SUCCESS,FAILED',
            'algorithm_name' => 'nullable|string|in:CLUSTERIZATION,GENETIC_ALGORITHM,REVERSE_GENETIC_ALGORITHM,SEASONALITY_ANALYSIS,PRICE_FORECASTING',
        ];
    }

    public function messages(): array
    {
        return [
            'date.date' => 'Дата должна быть в корректном формате',
        ];
    }
}

