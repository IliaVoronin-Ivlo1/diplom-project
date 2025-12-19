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
        Schema::table('genetic_algorithm_supplier_rankings', function (Blueprint $table) {
            $table->decimal('avg_price', 10, 2)->nullable()->after('fitness_score');
            $table->decimal('success_rate', 5, 2)->nullable()->after('avg_price');
            $table->decimal('avg_delivery_time', 10, 2)->nullable()->after('success_rate');
            $table->decimal('denial_rate', 5, 2)->nullable()->after('avg_delivery_time');
            $table->integer('orders_count')->nullable()->after('denial_rate');
            $table->decimal('total_revenue', 15, 2)->nullable()->after('orders_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('genetic_algorithm_supplier_rankings', function (Blueprint $table) {
            $table->dropColumn(['avg_price', 'success_rate', 'avg_delivery_time', 'denial_rate', 'orders_count', 'total_revenue']);
        });
    }
};
