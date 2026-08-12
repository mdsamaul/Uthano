<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farmers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('farmer_code')->unique();
            $table->string('full_name');
            $table->string('phone')->unique();
            $table->string('alternate_phone')->nullable();
            $table->string('national_id')->nullable();
            $table->string('photo')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED'])->default('ACTIVE');
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farmer_id')->constrained()->cascadeOnDelete();
            $table->string('farm_code')->unique();
            $table->string('farm_name');
            $table->string('division');
            $table->string('district');
            $table->string('upazila');
            $table->string('union')->nullable();
            $table->string('village');
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('land_area', 10, 2)->nullable();
            $table->string('land_area_unit')->nullable();
            $table->string('soil_type')->nullable();
            $table->string('irrigation_type')->nullable();
            $table->string('farming_method')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED'])->default('ACTIVE');
            $table->enum('verification_status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('farm_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->string('document_type');
            $table->string('document_path');
            $table->string('document_name')->nullable();
            $table->enum('status', ['PENDING', 'VERIFIED', 'REJECTED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_documents');
        Schema::dropIfExists('farms');
        Schema::dropIfExists('farmers');
    }
};