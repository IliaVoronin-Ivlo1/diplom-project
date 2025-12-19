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
        Schema::create('seasonality_analysis_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('history_id')->constrained('analysis_history')->onDelete('cascade');
            $table->string('article');
            $table->string('brand');
            $table->jsonb('monthly_coefficients');
            $table->jsonb('quarterly_coefficients')->nullable();
            $table->jsonb('weekly_coefficients')->nullable();
            $table->jsonb('trend');
            $table->jsonb('anomalies')->nullable();
            $table->timestamps();
            
            $table->index('history_id');
            $table->index(['article', 'brand']);
            $table->index(['history_id', 'article', 'brand']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seasonality_analysis_results');
    }
};
