# UTHANO API - Complete Command Reference

## Table of Contents
1. [Installation Commands](#installation-commands)
2. [Development Commands](#development-commands)
3. [Database Commands](#database-commands)
4. [Testing Commands](#testing-commands)
5. [API Documentation Commands](#api-documentation-commands)
6. [Docker Commands](#docker-commands)
7. [Production Commands](#production-commands)
8. [Troubleshooting Commands](#troubleshooting-commands)

---

## Installation Commands

### Initial Setup
```bash
# Install PHP dependencies
composer install

# Install NPM dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database (if using SQLite)
touch database/database.sqlite

# Run migrations
php artisan migrate --force

# Seed database (optional)
php artisan db:seed

# Generate API documentation
php artisan l5-swagger:generate

# Build frontend assets (if applicable)
npm run build
```

### One-Command Setup
```bash
# Using composer script (if configured)
composer run setup
```

---

## Development Commands

### Start Development Server
```bash
# Start Laravel development server
php artisan serve

# Start with specific port
php artisan serve --port=8080

# Start with specific host
php artisan serve --host=0.0.0.0
```

### Queue Worker
```bash
# Start queue worker
php artisan queue:work

# Start queue worker with specific queue
php artisan queue:work --queue=emails,notifications

# Start queue worker with timeout
php artisan queue:work --timeout=3600

# Listen to queue (for development)
php artisan queue:listen
```

### Log Monitoring
```bash
# Monitor logs in real-time
php artisan pail

# Monitor specific log file
tail -f storage/logs/laravel.log
```

### Frontend Development
```bash
# Start Vite dev server
npm run dev

# Build for production
npm run build

# Watch for changes
npm run watch
```

### Full Development Stack
```bash
# Run all development services concurrently
composer run dev

# Or manually:
# Terminal 1: php artisan serve
# Terminal 2: php artisan queue:listen --tries=1 --timeout=0
# Terminal 3: php artisan pail --timeout=0
# Terminal 4: npm run dev
```

---

## Database Commands

### Migrations
```bash
# Run all pending migrations
php artisan migrate

# Run migrations with force (production)
php artisan migrate --force

# Rollback last migration
php artisan migrate:rollback

# Rollback all migrations
php artisan migrate:reset

# Rollback and re-run all migrations
php artisan migrate:fresh

# Rollback specific number of migrations
php artisan migrate:rollback --step=3

# Show migration status
php artisan migrate:status
```

### Seeders
```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=RoleAndPermissionSeeder

# Fresh database with seeders
php artisan migrate:fresh --seed
```

### Database Operations
```bash
# Create new migration
php artisan make:migration create_products_table

# Create migration with table name
php artisan make:migration add_price_to_products_table --table=products

# Create seeder
php artisan make:seeder ProductSeeder

# Create factory
php artisan make:factory ProductFactory

# Refresh database
php artisan migrate:fresh --seed
```

---

## Testing Commands

### Run Tests
```bash
# Run all tests
php artisan test

# Run tests with coverage
php artisan test --coverage

# Run specific test file
php artisan test --filter=OrderApiTest

# Run specific test method
php artisan test --filter=test_admin_can_create_order

# Run tests in parallel
php artisan test --parallel

# Run unit tests only
php artisan test --testsuite=Unit

# Run feature tests only
php artisan test --testsuite=Feature
```

### Using PHPUnit Directly
```bash
# Run all tests
./vendor/bin/phpunit

# Run with coverage
./vendor/bin/phpunit --coverage

# Run specific test
./vendor/bin/phpunit tests/Feature/Api/V1/OrderApiTest.php

# Run with filter
./vendor/bin/phpunit --filter test_customer_can_create_order
```

### Test Database
```bash
# Refresh test database
php artisan migrate:fresh --seed --env=testing

# Run tests with specific environment
php artisan test --env=testing
```

---

## API Documentation Commands

### L5-Swagger
```bash
# Generate API documentation
php artisan l5-swagger:generate

# Generate and publish
php artisan l5-swagger:generate --publish

# Clear generated docs
php artisan l5-swagger:clear

# Publish config
php artisan vendor:publish --provider="L5Swagger\L5SwaggerServiceProvider"
```

### Access Documentation
```bash
# View documentation in browser
# Navigate to: http://localhost:8000/api/documentation

# View JSON spec
# Navigate to: http://localhost:8000/api/docs.json
```

---

## Docker Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d mysql

# Start with build
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
```

### Stop Services
```bash
# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v
```

### Docker Management
```bash
# List running containers
docker-compose ps

# Execute command in container
docker-compose exec app php artisan migrate

# Access container shell
docker-compose exec app bash

# View container logs
docker-compose logs app

# Restart service
docker-compose restart app
```

### Docker Build
```bash
# Build images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull
```

---

## Production Commands

### Deployment
```bash
# Install dependencies (no dev)
composer install --no-dev --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Generate API docs
php artisan l5-swagger:generate

# Set permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Maintenance Mode
```bash
# Enable maintenance mode
php artisan down

# Enable maintenance mode with message
php artisan down --message="Upgrading system"

# Enable maintenance mode with retry
php artisan down --retry=60

# Disable maintenance mode
php artisan up
```

### Queue Management
```bash
# Start queue worker (production)
php artisan queue:work --daemon --queue=default --sleep=3 --tries=3 --max-time=3600

# Restart queue workers
php artisan queue:restart

# Monitor failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### Cache Management
```bash
# Clear all cache
php artisan cache:clear

# Clear config cache
php artisan config:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear

# Optimize all
php artisan optimize

# Clear optimization
php artisan optimize:clear
```

### Database Backup
```bash
# Backup database (MySQL)
mysqldump -u username -p database_name > backup.sql

# Restore database
mysql -u username -p database_name < backup.sql

# Backup with timestamp
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Artisan Commands

### Create Commands
```bash
# Create new command
php artisan make:command SendNotifications

# Create command with signature
php artisan make:command SendNotifications --command=notifications:send
```

### Run Commands
```bash
# List all commands
php artisan list

# Get help for command
php artisan help migrate

# Run command with options
php artisan migrate --force --path=/database/migrations/custom
```

### Useful Built-in Commands
```bash
# Clear compiled files
php artisan clear-compiled

# Dump autoloader
composer dump-autoload

# List routes
php artisan route:list

# List routes with middleware
php artisan route:list --middleware=auth

# List routes for specific method
php artisan route:list --path=api

# View application configuration
php artisan config:show

# Create symbolic link for storage
php artisan storage:link

# Tinker (REPL)
php artisan tinker
```

---

## Troubleshooting Commands

### Permission Issues
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Fix cache permissions
chmod -R 775 storage/framework/cache
chmod -R 775 storage/framework/sessions
chmod -R 775 storage/framework/views
```

### Cache Issues
```bash
# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Database Issues
```bash
# Check database connection
php artisan db:show

# Run database migrations
php artisan migrate --force

# Check migration status
php artisan migrate:status

# Fix foreign key issues
php artisan migrate:refresh --path=/database/migrations/foreign_keys
```

### Composer Issues
```bash
# Update composer dependencies
composer update

# Install dependencies
composer install

# Dump autoloader
composer dump-autoload

# Check for security vulnerabilities
composer audit

# Fix security vulnerabilities
composer audit --fix
```

### Queue Issues
```bash
# Restart queue workers
php artisan queue:restart

# Clear failed jobs
php artisan queue:flush

# Retry failed jobs
php artisan queue:retry all

# Monitor queue
php artisan queue:monitor
```

### Log Issues
```bash
# Clear logs
> storage/logs/laravel.log

# View last 100 lines
tail -n 100 storage/logs/laravel.log

# Search for errors
grep -i error storage/logs/laravel.log

# Monitor logs in real-time
tail -f storage/logs/laravel.log
```

---

## Environment-Specific Commands

### Development
```bash
# Start development server
php artisan serve

# Run tests
php artisan test

# Generate docs
php artisan l5-swagger:generate

# Clear cache
php artisan cache:clear
```

### Staging
```bash
# Deploy
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Run tests
php artisan test --env=staging

# Clear cache
php artisan cache:clear
```

### Production
```bash
# Deploy
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start queue worker
php artisan queue:work --daemon --sleep=3 --tries=3

# Monitor
php artisan pail
```

---

## Git Commands

### Daily Workflow
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit changes
git commit -m "Add new feature"

# Push changes
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main
```

### Tagging Release
```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# List tags
git tag

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## NPM Commands

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Package Management
```bash
# Update packages
npm update

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Remove package
npm uninstall package-name
```

---

## Quick Reference

### Most Used Commands
```bash
# Start development
php artisan serve

# Run tests
php artisan test

# Clear cache
php artisan cache:clear

# Run migrations
php artisan migrate --force

# Generate docs
php artisan l5-swagger:generate

# Docker start
docker-compose up -d

# Docker stop
docker-compose down
```

### Emergency Commands
```bash
# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Fix permissions
chmod -R 775 storage bootstrap/cache

# Restart queue
php artisan queue:restart

# Enable maintenance mode
php artisan down

# Disable maintenance mode
php artisan up
```

---

## Notes

- Always run `php artisan migrate --force` in production
- Use `--no-interaction` flag for automated scripts
- Backup database before running migrations in production
- Test commands in development before running in production
- Monitor logs regularly for errors
- Keep dependencies updated regularly

---

## Support

For command-related issues:
- Check Laravel documentation: https://laravel.com/docs
- Check L5-Swagger docs: https://github.com/DarkaOnLine/L5-Swagger
- Check Docker docs: https://docs.docker.com

---

**Last Updated:** 2026-08-11
**Version:** 1.0.0