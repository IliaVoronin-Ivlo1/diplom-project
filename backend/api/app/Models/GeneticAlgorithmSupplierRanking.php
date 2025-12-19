<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneticAlgorithmSupplierRanking extends Model
{
    protected $fillable = [
        'run_id',
        'supplier_id',
        'service_name',
        'name',
        'fitness_score',
        'has_combinations',
        'rank'
    ];

    protected $casts = [
        'run_id' => 'integer',
        'supplier_id' => 'integer',
        'fitness_score' => 'decimal:6',
        'has_combinations' => 'boolean',
        'rank' => 'integer'
    ];

    public function run()
    {
        return $this->belongsTo(GeneticAlgorithmRun::class, 'run_id');
    }

    public function articleBrandRankings()
    {
        return $this->hasMany(GeneticAlgorithmArticleBrandRanking::class, 'supplier_ranking_id');
    }
}
