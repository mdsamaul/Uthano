<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('harvest_batch_id')->constrained();
            $table->foreignId('warehouse_id')->constrained();
            $table->decimal('quantity', 12, 2)->default(0);
            $table->decimal('reserved_quantity', 12, 2)->default(0);
            $table->decimal('available_quantity', 12, 2)->default(0);
            $table->foreignId('unit_id')->constrained('units');
            $table->enum('status', ['ACTIVE', 'LOW', 'OUT_OF_STOCK', 'EXPIRED', 'QUARANTINED'])->default('ACTIVE');
            $table->timestamps();

            $table->unique(['product_id', 'harvest_batch_id', 'warehouse_id']);
            $table->index(['product_id', 'warehouse_id', 'status']);
            $table->index(['harvest_batch_id']);
        });

        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('movement_type', ['IN', 'OUT', 'RESERVED', 'RELEASED', 'ADJUSTMENT', 'DAMAGED', 'EXPIRED', 'RETURNED', 'TRANSFER_IN', 'TRANSFER_OUT'])->default('IN');
            $table->decimal('quantity', 12, 2);
            $table->decimal('quantity_before', 12, 2);
            $table->decimal('quantity_after', 12, 2);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['inventory_item_id', 'movement_type']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventory_items');
    }
};