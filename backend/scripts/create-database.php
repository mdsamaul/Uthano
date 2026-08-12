<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule();
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'database' => null,
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
]);

$capsule->setAsGlobal();
$capsule->getConnection()->getPdo()->exec('CREATE DATABASE IF NOT EXISTS uthano CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

echo "Database 'uthano' created successfully.\n";