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
        Schema::create('reverse_genetic_algorithm_supplier_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_brand_ranking_id')->constrained('reverse_genetic_algorithm_article_brand_rankings')->onDelete('cascade');
            $table->integer('supplier_id');
            $table->string('service_name');
            $table->text('supplier_name');
            $table->decimal('fitness_score', 10, 6);
            $table->integer('rank')->nullable();
            $table->decimal('avg_price', 10, 2);
            $table->decimal('success_rate', 5, 2);
            $table->decimal('avg_delivery_time', 10, 2);
            $table->decimal('denial_rate', 5, 2);
            $table->integer('orders_count');
            $table->decimal('total_revenue', 15, 2);
            $table->timestamps();
            
            $table->index('article_brand_ranking_id', 'rev_ga_supplier_ranking_ab_ranking_idx');
            $table->index(['article_brand_ranking_id', 'fitness_score'], 'rev_ga_supplier_ranking_ab_fitness_idx');
            $table->index('supplier_id', 'rev_ga_supplier_ranking_supplier_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reverse_genetic_algorithm_supplier_rankings');
    }
};
