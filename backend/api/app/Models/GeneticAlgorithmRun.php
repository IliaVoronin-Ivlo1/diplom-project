<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeneticAlgorithmRun extends Model
{
    protected $fillable = [
        'fitness_threshold',
        'execution_time',
        'suppliers_count',
        'filtered_suppliers_count'
    ];

    protected $casts = [
        'fitness_threshold' => 'decimal:2',
        'execution_time' => 'decimal:2',
        'suppliers_count' => 'integer',
        'filtered_suppliers_count' => 'integer'
    ];

    public function supplierRankings()
    {
        return $this->hasMany(GeneticAlgorithmSupplierRanking::class, 'run_id');
    }
}
