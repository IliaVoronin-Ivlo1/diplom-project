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
        Schema::table('genetic_algorithm_article_brand_rankings', function (Blueprint $table) {
            $table->decimal('avg_price', 10, 2)->nullable()->after('success_rate');
            $table->decimal('avg_delivery_time', 10, 2)->nullable()->after('avg_price');
            $table->decimal('total_revenue', 15, 2)->nullable()->after('avg_delivery_time');
            $table->decimal('denial_rate', 5, 2)->nullable()->after('total_revenue');
        });
    }

    public function down(): void
    {
        Schema::table('genetic_algorithm_article_brand_rankings', function (Blueprint $table) {
            $table->dropColumn(['avg_price', 'avg_delivery_time', 'total_revenue', 'denial_rate']);
        });
    }
};
