<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AlgorithmSchedule extends Model
{
    protected $fillable = [
        'algorithm_type',
        'schedule_hours',
        'schedule_minutes',
        'last_run_at'
    ];

    protected $casts = [
        'schedule_hours' => 'integer',
        'schedule_minutes' => 'integer',
        'last_run_at' => 'datetime'
    ];
}
