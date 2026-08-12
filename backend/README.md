# UTHANO API

<p align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo">
</p>

<p align="center">
  <strong>"From Farm to Family"</strong>
</p>

## About UTHANO

UTHANO is a comprehensive farm-to-table marketplace platform that connects farmers directly with customers. This API provides a complete backend solution for managing products, orders, deliveries, inventory, and more.

## Features

- **User Management**: Role-based access control (Admin, Staff, Warehouse Manager, Farmer, Customer)
- **Product Catalog**: Product management with variants, images, and inventory tracking
- **Order Management**: Complete order lifecycle from placement to delivery
- **Cart System**: Shopping cart with real-time updates
- **Delivery Management**: Delivery agents, zones, and status tracking
- **Inventory Management**: Warehouse and inventory tracking with traceability
- **Quality Control**: Quality checks for products with approval/rejection workflow
- **Product Reviews**: Customer reviews and ratings system
- **Coupon System**: Promotional coupons with usage tracking
- **Packaging Management**: Packaging types and items tracking
- **Notifications**: Real-time notifications for users
- **Audit Logs**: Comprehensive audit trail for all actions
- **Farmer Portal**: Dedicated portal for farmers to manage their produce
- **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: Laravel 12.x
- **PHP**: 8.2+
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **API Documentation**: L5-Swagger
- **Testing**: PHPUnit

## Requirements

- PHP 8.2 or higher
- Composer
- MySQL 5.7+
- Node.js & NPM (for frontend assets)

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/uthano-backend.git
cd uthano-backend
```

2. Install dependencies
```bash
composer install
npm install
```

3. Configure environment
```bash
cp .env.example .env
php artisan key:generate
```

4. Update `.env` file with your database credentials and other settings

5. Run migrations
```bash
php artisan migrate --force
```

6. Seed the database (optional)
```bash
php artisan db:seed
```

7. Generate API documentation
```bash
php artisan l5-swagger:generate
```

8. Start the development server
```bash
php artisan serve
```

## API Documentation

Once the application is running, access the API documentation at:

```
http://localhost:8000/api/documentation
```

## API Endpoints

### Public Routes
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/products` - List products (public catalog)
- `GET /api/v1/products/{id}` - Get product details

### Authenticated Routes
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/notifications` - List user notifications
- `GET /api/v1/customer/profile` - Get customer profile
- `PUT /api/v1/customer/profile` - Update customer profile
- `GET /api/v1/cart` - Get shopping cart
- `POST /api/v1/cart/items` - Add item to cart
- `GET /api/v1/orders` - List user orders
- `POST /api/v1/orders` - Place new order

### Admin Routes (requires admin, staff, or warehouse_manager role)
- `GET /api/v1/admin/dashboard` - Dashboard summary
- `GET /api/v1/admin/products` - List all products
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/{id}` - Update product
- `DELETE /api/v1/admin/products/{id}` - Delete product
- `GET /api/v1/admin/farmers` - List farmers
- `GET /api/v1/admin/farms` - List farms
- `GET /api/v1/admin/harvests` - List harvests
- `GET /api/v1/admin/warehouses` - List warehouses
- `GET /api/v1/admin/inventory` - List inventory
- `GET /api/v1/admin/quality-checks` - List quality checks
- `GET /api/v1/admin/product-reviews` - List product reviews
- `GET /api/v1/admin/coupons` - List coupons
- `GET /api/v1/admin/packaging-types` - List packaging types
- `GET /api/v1/admin/packaging-items` - List packaging items
- `GET /api/v1/admin/delivery-agents` - List delivery agents
- `GET /api/v1/admin/delivery-zones` - List delivery zones
- `GET /api/v1/admin/deliveries` - List deliveries
- `GET /api/v1/admin/audit-logs` - List audit logs

### Farmer Portal Routes (requires farmer role)
- `GET /api/v1/farmer/dashboard` - Farmer dashboard
- `GET /api/v1/farmer/farms` - Farmer's farms
- `GET /api/v1/farmer/harvests` - Farmer's harvests
- `GET /api/v1/farmer/sourcing-records` - Farmer's sourcing records
- `GET /api/v1/farmer/earnings` - Farmer's earnings

## Testing

Run the test suite:
```bash
php artisan test
```

## Postman Collection

Import the Postman collection from `postman/UTHANO_API_Collection.json` to test the API endpoints.

## Docker Setup

Docker configuration is available for easy deployment:
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@uthano.com or create an issue in the repository.