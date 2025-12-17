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
        Schema::create('price_forecasting_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('history_id')->constrained('analysis_history')->onDelete('cascade');
            $table->string('article');
            $table->string('brand');
            $table->jsonb('forecast_data');
            $table->jsonb('accuracy_metrics')->nullable();
            $table->jsonb('model_info')->nullable();
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
        Schema::dropIfExists('price_forecasting_results');
    }
};
