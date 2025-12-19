<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReverseGeneticAlgorithmArticleBrandRanking extends Model
{
    protected $fillable = [
        'run_id',
        'article',
        'brand',
        'fitness_score',
        'rank',
        'avg_price',
        'success_rate',
        'avg_delivery_time',
        'denial_rate',
        'orders_count',
        'total_revenue'
    ];

    protected $casts = [
        'run_id' => 'integer',
        'fitness_score' => 'decimal:6',
        'rank' => 'integer',
        'avg_price' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'avg_delivery_time' => 'decimal:2',
        'denial_rate' => 'decimal:2',
        'orders_count' => 'integer',
        'total_revenue' => 'decimal:2'
    ];

    public function run()
    {
        return $this->belongsTo(ReverseGeneticAlgorithmRun::class, 'run_id');
    }

    public function supplierRankings()
    {
        return $this->hasMany(ReverseGeneticAlgorithmSupplierRanking::class, 'article_brand_ranking_id');
    }
}
