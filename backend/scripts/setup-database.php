<?php

// Database configuration
$host = '127.0.0.1';
$port = 3306;
$username = 'root';
$password = '';
$database = 'uthano';

// Create connection without database (pass empty string for dbname, then port)
$conn = new mysqli($host, $username, $password, '', $port);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error . "\n");
}

echo "Connected to MySQL successfully\n";

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) {
    echo "Database '$database' created successfully (or already exists)\n";
} else {
    die("Error creating database: " . $conn->error . "\n");
}

// Close connection
$conn->close();

echo "Database setup completed!\n";
