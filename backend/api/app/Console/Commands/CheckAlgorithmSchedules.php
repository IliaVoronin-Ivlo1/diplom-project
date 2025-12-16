<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AlgorithmSchedule;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckAlgorithmSchedules extends Command
{
    protected $signature = 'algorithm-schedules:check';

    protected $description = 'Check and run algorithms based on schedule';

    public function handle()
    {
        $schedules = AlgorithmSchedule::all();
        $now = Carbon::now();

        foreach ($schedules as $schedule) {
            $shouldRun = false;

            if ($schedule->last_run_at === null) {
                $shouldRun = $this->shouldRunFirstTime($now, $schedule->schedule_hours, $schedule->schedule_minutes);
            } else {
                $lastRun = Carbon::parse($schedule->last_run_at);
                $nextRunTime = $lastRun->copy()->addHours($schedule->schedule_hours)->minute($schedule->schedule_minutes)->second(0);

                if ($now->minute === $schedule->schedule_minutes && $now->greaterThanOrEqualTo($nextRunTime)) {
                    $shouldRun = true;
                }
            }

            if ($shouldRun) {
                $this->runAlgorithm($schedule);
                $schedule->last_run_at = $now;
                $schedule->save();
            }
        }
    }

    private function shouldRunFirstTime(Carbon $time, int $hours, int $minutes): bool
    {
        if ($time->minute !== $minutes) {
            return false;
        }

        $currentHour = $time->hour;
        return ($currentHour % $hours === 0);
    }

    private function runAlgorithm(AlgorithmSchedule $schedule): void
    {
        try {
            switch ($schedule->algorithm_type) {
                case 'clustering':
                    Artisan::call('clustering-start');
                    Log::info('CheckAlgorithmSchedules[runAlgorithm]', ['algorithm' => 'clustering', 'status' => 'started']);
                    break;
                case 'genetic_algorithm':
                    Artisan::call('genetic-algorithm-start', ['--threshold' => 0.5]);
                    Log::info('CheckAlgorithmSchedules[runAlgorithm]', ['algorithm' => 'genetic_algorithm', 'status' => 'started']);
                    break;
                case 'reverse_genetic_algorithm':
                    Artisan::call('reverse-genetic-algorithm-start');
                    Log::info('CheckAlgorithmSchedules[runAlgorithm]', ['algorithm' => 'reverse_genetic_algorithm', 'status' => 'started']);
                    break;
            }
        } catch (\Exception $e) {
            Log::error('CheckAlgorithmSchedules[runAlgorithm]', [
                'algorithm' => $schedule->algorithm_type,
                'error' => $e->getMessage()
            ]);
        }
    }
}
