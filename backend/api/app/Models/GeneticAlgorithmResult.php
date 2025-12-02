<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneticAlgorithmResult extends Model
{
    protected $table = 'genetic_algorithm_results';

    protected $fillable = ['content'];

    protected $casts = [
        'content' => 'array',
    ];
}
