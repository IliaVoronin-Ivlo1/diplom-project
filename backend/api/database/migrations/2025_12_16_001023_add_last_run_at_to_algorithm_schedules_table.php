<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('algorithm_schedules', function (Blueprint $table) {
            $table->timestamp('last_run_at')->nullable()->after('schedule_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('algorithm_schedules', function (Blueprint $table) {
            $table->dropColumn('last_run_at');
        });
    }
};
