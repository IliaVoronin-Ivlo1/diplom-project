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
        Schema::create('genetic_algorithm_article_brand_rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_ranking_id')->constrained('genetic_algorithm_supplier_rankings')->onDelete('cascade');
            $table->string('article');
            $table->string('brand');
            $table->decimal('fitness_score', 10, 6);
            $table->integer('orders_count');
            $table->decimal('success_rate', 5, 2);
            $table->integer('rank')->nullable();
            $table->timestamps();
            
            $table->index('supplier_ranking_id');
            $table->index(['supplier_ranking_id', 'fitness_score']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genetic_algorithm_article_brand_rankings');
    }
};
