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
        Schema::create('reverse_genetic_algorithm_runs', function (Blueprint $table) {
            $table->id();
            $table->decimal('execution_time', 10, 2);
            $table->integer('combinations_count');
            $table->timestamps();
            
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reverse_genetic_algorithm_runs');
    }
};
