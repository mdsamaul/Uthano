<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Customers who authenticate purely via phone + OTP may not have an email.
 * Make the email column nullable to reflect that.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restoring NOT NULL is only safe if no null emails exist.
            $table->string('email')->nullable(false)->change();
        });
    }
};