<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneticAlgorithmArticleBrandRanking extends Model
{
    protected $fillable = [
        'supplier_ranking_id',
        'article',
        'brand',
        'fitness_score',
        'orders_count',
        'success_rate',
        'rank'
    ];

    protected $casts = [
        'supplier_ranking_id' => 'integer',
        'fitness_score' => 'decimal:6',
        'orders_count' => 'integer',
        'success_rate' => 'decimal:2',
        'rank' => 'integer'
    ];

    public function supplierRanking()
    {
        return $this->belongsTo(GeneticAlgorithmSupplierRanking::class, 'supplier_ranking_id');
    }
}
