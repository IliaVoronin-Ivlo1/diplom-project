<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalysisHistory extends Model
{
    protected $table = 'analysis_history';

    public const NAME_CLUSTERIZATION = 'CLUSTERIZATION';
    public const NAME_GENETIC_ALGORITHM = 'GENETIC_ALGORITHM';
    public const NAME_REVERSE_GENETIC_ALGORITHM = 'REVERSE_GENETIC_ALGORITHM';

    public const STATUS_IN_PROCESS = 'IN_PROCESS';
    public const STATUS_SUCCESS = 'SUCCESS';
    public const STATUS_FAILED = 'FAILED';

    protected $fillable = [
        'name',
        'status'
    ];
}
