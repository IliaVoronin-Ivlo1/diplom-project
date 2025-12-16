<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('algorithm_schedules', function (Blueprint $table) {
            $table->integer('schedule_minutes')->default(0)->after('schedule_hours');
        });
    }

    public function down(): void
    {
        Schema::table('algorithm_schedules', function (Blueprint $table) {
            $table->dropColumn('schedule_minutes');
        });
    }
};
