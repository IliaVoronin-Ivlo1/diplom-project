<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReverseGeneticAlgorithmSupplierRanking extends Model
{
    protected $fillable = [
        'article_brand_ranking_id',
        'supplier_id',
        'service_name',
        'supplier_name',
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
        'article_brand_ranking_id' => 'integer',
        'supplier_id' => 'integer',
        'fitness_score' => 'decimal:6',
        'rank' => 'integer',
        'avg_price' => 'decimal:2',
        'success_rate' => 'decimal:2',
        'avg_delivery_time' => 'decimal:2',
        'denial_rate' => 'decimal:2',
        'orders_count' => 'integer',
        'total_revenue' => 'decimal:2'
    ];

    public function articleBrandRanking()
    {
        return $this->belongsTo(ReverseGeneticAlgorithmArticleBrandRanking::class, 'article_brand_ranking_id');
    }
}
