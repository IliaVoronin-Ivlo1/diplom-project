<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AlgorithmSchedule;

class AlgorithmScheduleSeeder extends Seeder
{
    public function run(): void
    {
        AlgorithmSchedule::updateOrCreate(
            ['algorithm_type' => 'clustering'],
            ['schedule_hours' => 6, 'schedule_minutes' => 1]
        );

        AlgorithmSchedule::updateOrCreate(
            ['algorithm_type' => 'genetic_algorithm'],
            ['schedule_hours' => 6, 'schedule_minutes' => 1]
        );

        AlgorithmSchedule::updateOrCreate(
            ['algorithm_type' => 'reverse_genetic_algorithm'],
            ['schedule_hours' => 6, 'schedule_minutes' => 1]
        );
    }
}
