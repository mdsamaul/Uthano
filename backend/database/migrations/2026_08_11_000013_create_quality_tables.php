<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quality_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('harvest_batch_id')->constrained();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('checked_at');
            $table->string('appearance')->nullable();
            $table->string('freshness')->nullable();
            $table->decimal('damaged_quantity', 12, 2)->default(0);
            $table->decimal('accepted_quantity', 12, 2)->default(0);
            $table->decimal('rejected_quantity', 12, 2)->default(0);
            $table->string('grade')->nullable();
            $table->enum('status', ['PASSED', 'PARTIAL', 'FAILED'])->default('PASSED');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['harvest_batch_id', 'status']);
            $table->index(['product_id', 'checked_at']);
        });

        Schema::create('product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customer_profiles');
            $table->foreignId('product_id')->constrained();
            $table->foreignId('order_id')->constrained();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->tinyInteger('rating')->unsigned();
            $table->string('title')->nullable();
            $table->text('comment')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->timestamps();

            $table->unique(['customer_id', 'product_id', 'order_id']);
            $table->index(['product_id', 'status']);
        });

        Schema::create('review_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('product_reviews')->cascadeOnDelete();
            $table->string('image_path');
            $table->string('image_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_images');
        Schema::dropIfExists('product_reviews');
        Schema::dropIfExists('quality_checks');
    }
};