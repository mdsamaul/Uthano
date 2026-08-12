<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('district');
            $table->string('area')->nullable();
            $table->decimal('base_charge', 12, 2)->default(0);
            $table->decimal('weight_based_charge', 12, 2)->default(0);
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();

            $table->index(['district', 'status']);
        });

        Schema::create('delivery_agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('agent_code')->unique();
            $table->string('phone');
            $table->string('vehicle_type');
            $table->string('vehicle_number')->nullable();
            $table->enum('status', ['ACTIVE', 'INACTIVE', 'SUSPENDED'])->default('ACTIVE');
            $table->timestamps();
        });

        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('delivery_code')->unique();
            $table->foreignId('delivery_agent_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('delivery_zone_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pickup_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('out_for_delivery_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->enum('status', ['PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNING', 'RETURNED'])->default('PENDING');
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->text('customer_note')->nullable();
            $table->string('proof_of_delivery')->nullable();
            $table->timestamps();

            $table->index(['order_id']);
            $table->index(['delivery_agent_id', 'status']);
            $table->index(['status']);
        });

        Schema::create('delivery_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['PENDING', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED', 'RETURNING', 'RETURNED']);
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['delivery_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_status_histories');
        Schema::dropIfExists('deliveries');
        Schema::dropIfExists('delivery_agents');
        Schema::dropIfExists('delivery_zones');
    }
};