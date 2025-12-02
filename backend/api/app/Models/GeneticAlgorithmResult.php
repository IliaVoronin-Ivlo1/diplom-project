<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneticAlgorithmResult extends Model
{
    protected $fillable = ['content'];

    protected $casts = [
        'content' => 'array',
    ];
}
