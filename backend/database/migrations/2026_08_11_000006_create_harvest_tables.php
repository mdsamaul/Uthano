<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_crops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->date('planting_date')->nullable();
            $table->date('expected_harvest_date')->nullable();
            $table->date('actual_harvest_date')->nullable();
            $table->decimal('cultivation_area', 10, 2)->nullable();
            $table->string('cultivation_area_unit')->nullable();
            $table->string('cultivation_method')->nullable();
            $table->enum('status', ['PLANNED', 'GROWING', 'READY', 'HARVESTED', 'CANCELLED'])->default('PLANNED');
            $table->timestamps();

            $table->unique(['farm_id', 'product_id']);
            $table->index(['farm_id', 'status']);
        });

        Schema::create('harvests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained();
            $table->foreignId('farm_crop_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_id')->constrained();
            $table->string('harvest_code')->unique();
            $table->date('harvest_date');
            $table->decimal('estimated_quantity', 12, 2)->nullable();
            $table->decimal('actual_quantity', 12, 2);
            $table->foreignId('quantity_unit_id')->constrained('units');
            $table->string('quality_grade')->nullable();
            $table->enum('status', ['RECORDED', 'QUALITY_CHECKED', 'BATCHED', 'REJECTED'])->default('RECORDED');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['farm_id', 'harvest_date']);
            $table->index(['product_id', 'harvest_date']);
        });

        Schema::create('harvest_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('harvest_id')->constrained()->cascadeOnDelete();
            $table->string('batch_code')->unique();
            $table->foreignId('product_id')->constrained();
            $table->decimal('quantity', 12, 2);
            $table->decimal('remaining_quantity', 12, 2);
            $table->foreignId('unit_id')->constrained('units');
            $table->string('quality_grade')->nullable();
            $table->timestamp('harvested_at');
            $table->timestamp('expiry_date')->nullable();
            $table->enum('status', ['CREATED', 'COLLECTED', 'IN_TRANSIT', 'RECEIVED', 'AVAILABLE', 'PARTIALLY_SOLD', 'SOLD_OUT', 'REJECTED', 'EXPIRED'])->default('CREATED');
            $table->timestamps();

            $table->index(['product_id', 'status']);
            $table->index(['harvest_id']);
        });

        Schema::create('sourcing_records', function (Blueprint $table) {
            $table->id();
            $table->string('sourcing_code')->unique();
            $table->foreignId('farmer_id')->constrained();
            $table->foreignId('farm_id')->constrained();
            $table->foreignId('harvest_batch_id')->constrained();
            $table->foreignId('product_id')->constrained();
            $table->decimal('quantity', 12, 2);
            $table->foreignId('unit_id')->constrained('units');
            $table->decimal('purchase_price', 12, 2);
            $table->decimal('total_cost', 12, 2);
            $table->decimal('transport_cost', 12, 2)->default(0);
            $table->decimal('packaging_cost', 12, 2)->default(0);
            $table->decimal('other_cost', 12, 2)->default(0);
            $table->decimal('total_procurement_cost', 12, 2);
            $table->timestamp('sourced_at');
            $table->timestamp('received_at')->nullable();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['PENDING', 'PURCHASED', 'IN_TRANSIT', 'RECEIVED', 'REJECTED', 'CANCELLED'])->default('PENDING');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['farmer_id', 'sourced_at']);
            $table->index(['farm_id', 'sourced_at']);
            $table->index(['product_id', 'sourced_at']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sourcing_records');
        Schema::dropIfExists('harvest_batches');
        Schema::dropIfExists('harvests');
        Schema::dropIfExists('farm_crops');
    }
};