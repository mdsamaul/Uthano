<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, drop existing permission/role tables if they exist
        Schema::dropIfExists('permission_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        // Add role column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer')->after('is_active');
            $table->dropColumn(['email_verified_at', 'remember_token']);
        });

        // Set default role for existing users
        DB::statement('UPDATE users SET role = "customer" WHERE role IS NULL OR role = ""');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Re-create roles and permissions tables (simplified version)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Remove role column from users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('remember_token')->nullable();
        });
    }
};