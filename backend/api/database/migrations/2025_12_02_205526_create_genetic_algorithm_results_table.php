<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('genetic_algorithm_results', function (Blueprint $table) {
            $table->id();
            $table->jsonb('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('genetic_algorithm_results');
    }
};
