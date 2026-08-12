<?php
$db = new SQLite3(__DIR__ . '/database/database.sqlite');
$tables = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
echo "Tables in SQLite database:\n";
while ($row = $tables->fetchArray()) {
    echo ' - ' . $row['name'] . "\n";
}
$db->close();
