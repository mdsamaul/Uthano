<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packaging_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->decimal('capacity', 10, 2)->nullable();
            $table->string('capacity_unit')->nullable();
            $table->boolean('is_reusable')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('packaging_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('packaging_type_id')->constrained();
            $table->string('packaging_code')->unique();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customer_profiles')->nullOnDelete();
            $table->enum('status', ['AVAILABLE', 'ASSIGNED', 'WITH_CUSTOMER', 'RETURNED', 'DAMAGED', 'LOST'])->default('AVAILABLE');
            $table->timestamps();

            $table->index(['packaging_type_id', 'status']);
            $table->index(['warehouse_id', 'status']);
        });

        Schema::create('packaging_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('packaging_item_id')->constrained()->cascadeOnDelete();
            $table->enum('movement_type', ['IN', 'OUT', 'ASSIGNED', 'RETURNED', 'DAMAGED', 'LOST', 'TRANSFER'])->default('IN');
            $table->foreignId('from_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('to_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['packaging_item_id', 'movement_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packaging_movements');
        Schema::dropIfExists('packaging_items');
        Schema::dropIfExists('packaging_types');
    }
};