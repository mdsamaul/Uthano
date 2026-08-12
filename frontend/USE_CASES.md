# UTHANO Platform - Use Cases

## Overview
UTHANO is a comprehensive farm-to-home platform that connects Bangladeshi farmers directly with consumers. The platform ensures complete traceability of agricultural products from farm to family.

---

## User Roles

### 1. Customer (Consumer)
**Primary Goal:** Purchase fresh, traceable agricultural products directly from farmers

#### Use Cases:

**Browsing & Discovery**
- Browse products by category (fruits, vegetables, etc.)
- View farm profiles and their locations
- Search for specific products
- Filter products by farm, price, or availability
- View product details including origin, harvest date, and traceability information

**Cart & Checkout**
- Add products to cart
- Update quantities
- Remove items from cart
- View cart summary with total price
- Proceed to checkout
- Enter delivery address
- Select delivery time slot
- Choose payment method (Cash on Delivery)
- Place order

**Order Management**
- View order history
- Track order status (pending → confirmed → packed → delivered)
- View delivery details and tracking information
- Rate and review products after delivery
- Add products to wishlist for future purchase

**Account Management**
- Register new account
- Login/Logout
- Reset password
- Update profile information
- Manage multiple delivery addresses
- View order history and status

---

### 2. Farmer
**Primary Goal:** Manage farm operations and sell products directly to consumers

#### Use Cases:

**Farm Management**
- Register farm profile
- Update farm information (location, description, images)
- View farm statistics (sales, orders, revenue)
- Track farm performance metrics

**Product Management**
- Add new products with details (name, category, price, unit)
- Update product availability
- Set product pricing
- Upload product images
- Manage product inventory

**Harvest Management**
- Record new harvests
- Link harvests to specific products
- Track harvest dates and quantities
- View harvest history

**Batch Management**
- Create batches from harvests
- Assign batch numbers for traceability
- Track batch distribution
- View batch details and status

**Order Fulfillment**
- View incoming orders
- Confirm order receipt
- Update order status (confirmed → packed → ready for delivery)
- View customer delivery addresses
- Generate packing lists

**Sourcing & Supply Chain**
- Record sourcing information
- Track supply chain from farm to customer
- Maintain traceability records
- View sourcing history

**Analytics & Reports**
- View sales statistics (daily, weekly, monthly)
- Track popular products
- Monitor revenue trends
- Analyze customer preferences

---

### 3. Delivery Agent
**Primary Goal:** Manage and complete product deliveries

#### Use Cases:

**Delivery Management**
- View assigned deliveries
- See delivery details (address, customer name, phone, order items)
- Update delivery status (picked up → in transit → delivered)
- View delivery route and customer location
- Contact customer if needed

**Delivery History**
- View completed deliveries
- Track delivery performance
- View delivery statistics (total deliveries, success rate, average time)

**Profile Management**
- Update delivery agent information
- View assigned delivery zones
- Manage availability status

---

### 4. Admin
**Primary Goal:** Manage and oversee the entire platform operations

#### Use Cases:

**Dashboard & Analytics**
- View platform-wide statistics (total orders, revenue, users, farmers)
- Monitor daily/weekly/monthly sales
- Track platform growth metrics
- View recent activity feed

**Product Management**
- Add/edit/delete products
- Manage product categories
- Set product pricing guidelines
- Review product listings
- Manage product images and descriptions

**Category Management**
- Create product categories
- Update category information
- Assign products to categories
- Manage category hierarchy

**Order Management**
- View all orders across platform
- Update order status
- Handle order disputes
- Process refunds if needed
- View order details and history

**Customer Management**
- View all registered customers
- Manage customer accounts
- View customer purchase history
- Handle customer complaints
- Send notifications to customers

**Farmer Management**
- Approve new farmer registrations
- View farmer profiles and performance
- Manage farmer accounts
- Monitor farmer compliance
- View farmer sales statistics

**Farm Management**
- Review farm registrations
- Verify farm information
- Monitor farm operations
- Track farm performance

**Harvest Management**
- View all harvests across platform
- Monitor harvest quality
- Track harvest quantities
- Verify harvest records

**Batch Management**
- Track all batches
- Monitor batch distribution
- Ensure traceability compliance
- View batch details

**Inventory Management**
- Monitor overall inventory levels
- Track product availability
- Manage stock alerts
- View inventory reports

**Delivery Management**
- Assign deliveries to agents
- Monitor delivery performance
- Track delivery status
- Handle delivery issues
- View delivery analytics

**Quality Control**
- Review quality check reports
- Monitor product quality standards
- Handle quality complaints
- Track quality metrics

**Reports & Analytics**
- Generate sales reports
- View revenue analytics
- Export data for analysis
- Track platform KPIs
- Monitor user engagement

**System Management**
- Manage user roles and permissions
- Configure platform settings
- Handle system notifications
- Monitor platform health

---

## Key Features

### Traceability System
- Complete product traceability from farm to customer
- QR code generation for each batch
- Scan QR code to view full product journey
- Record and track supply chain events
- Verify product authenticity

### Payment & Pricing
- Cash on Delivery (COD) payment method
- Transparent pricing with no hidden fees
- Direct farmer-to-customer pricing
- Platform commission model
- Automated payment tracking

### Notification System
- Order confirmation notifications
- Delivery status updates
- Promotional notifications
- Account security alerts
- Toast notifications for user actions

### Search & Discovery
- Full-text product search
- Category-based browsing
- Farm-based filtering
- Price range filtering
- Sort by popularity, price, date

### Responsive Design
- Mobile-first approach
- Tablet-optimized layouts
- Desktop-friendly interface
- Touch-friendly navigation
- Progressive Web App (PWA) ready

---

## User Flows

### Customer Purchase Flow
1. Browse products → 2. View product details → 3. Add to cart → 4. Proceed to checkout → 5. Enter delivery address → 6. Select delivery slot → 7. Place order → 8. Receive confirmation → 9. Track delivery → 10. Receive product → 11. Rate & review

### Farmer Sales Flow
1. Login → 2. View dashboard → 3. Add product → 4. Record harvest → 5. Create batch → 6. Receive order notification → 7. Confirm order → 8. Pack order → 9. Mark ready for delivery → 10. View sales analytics

### Delivery Flow
1. Login → 2. View assigned deliveries → 3. Pick up order → 4. Navigate to customer → 5. Deliver product → 6. Update status → 7. Mark as delivered → 8. View delivery history

### Admin Management Flow
1. Login → 2. View dashboard → 3. Monitor orders → 4. Manage farmers → 5. Oversee deliveries → 6. Generate reports → 7. Handle issues → 8. Update platform settings

---

## Technical Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Validation:** Zod
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Fonts:** Inter, Noto Sans Bengali

---

## Platform Goals

1. **Empower Farmers:** Provide direct market access and fair pricing
2. **Ensure Quality:** Maintain high-quality standards through traceability
3. **Build Trust:** Complete transparency from farm to customer
4. **Support Local:** Promote Bangladeshi agriculture and farmers
5. **Deliver Fresh:** Ensure fast and reliable delivery of fresh products
6. **Create Community:** Connect consumers with their food sources

---

## Essential Commands

### Development
```bash
# Start development server
npm run dev

# Stop the dev server
Press Ctrl + C in the terminal
```

### Production Build
```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Code Quality
```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

### Package Management
```bash
# Install dependencies
npm install

# Update dependencies
npm update
```

### Troubleshooting
```bash
# Clear Next.js cache and restart (Windows)
rmdir /s /q .next
npm run dev

# Or using PowerShell
Remove-Item -Recurse -Force .next
npm run dev

# Reset everything
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```
