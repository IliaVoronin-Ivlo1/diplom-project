<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReverseGeneticAlgorithmRun extends Model
{
    protected $fillable = [
        'history_id',
        'execution_time',
        'combinations_count'
    ];

    protected $casts = [
        'execution_time' => 'decimal:2',
        'combinations_count' => 'integer'
    ];

    public function articleBrandRankings()
    {
        return $this->hasMany(ReverseGeneticAlgorithmArticleBrandRanking::class, 'run_id');
    }
}
