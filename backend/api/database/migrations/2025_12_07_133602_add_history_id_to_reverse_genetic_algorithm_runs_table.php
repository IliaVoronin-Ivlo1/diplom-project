<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reverse_genetic_algorithm_runs', function (Blueprint $table) {
            $table->foreignId('history_id')->nullable()->after('id')->constrained('analysis_history')->onDelete('cascade');
            $table->index('history_id');
        });
    }

    public function down(): void
    {
        Schema::table('reverse_genetic_algorithm_runs', function (Blueprint $table) {
            $table->dropForeign(['history_id']);
            $table->dropColumn('history_id');
        });
    }
};
