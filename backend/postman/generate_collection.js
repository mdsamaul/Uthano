/**
 * Generates the complete UTHANO API Postman Collection v2.1.0
 * Run: node backend/postman/generate_collection.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const collection = {
  info: {
    name: "UTHANO API",
    description: "UTHANO Farm-to-Home Marketplace REST API - Complete Postman Collection\n\nAll endpoints are under /api/v1 prefix.\n\nAuthentication: Uses Laravel Sanctum. After login, use the returned token as a Bearer token in the Authorization header.\n\nRoles:\n- Public: No authentication required\n- Authenticated: Any logged-in user\n- Farmer: Users with 'farmer' role\n- Admin/Staff/Warehouse Manager: Users with 'admin', 'staff', or 'warehouse_manager' roles\n\nVariables:\n- base_url: API base URL (default: http://localhost:8000/api/v1)\n- docker_url: Docker nginx URL (http://localhost:80/api/v1)\n- token: Sanctum API token (set after login)\n- product_id: Last created product ID\n- farmer_id: Last created farmer ID\n- farm_id: Last created farm ID\n- harvest_id: Last created harvest ID\n- warehouse_id: Last created warehouse ID\n- inventory_id: Last inventory item ID\n- quality_check_id: Last quality check ID\n- review_id: Last product review ID\n- coupon_id: Last created coupon ID\n- packaging_type_id: Last created packaging type ID\n- packaging_item_id: Last created packaging item ID\n- delivery_agent_id: Last created delivery agent ID\n- delivery_zone_id: Last created delivery zone ID\n- delivery_id: Last created delivery ID\n- order_id: Last created order ID\n- notification_id: Last notification ID\n- address_id: Last created address ID\n- category_id: Last created category ID\n- customer_id: Last created customer ID\n- audit_log_id: Last audit log ID\n- sourcing_id: Last created sourcing record ID",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    _exporter_id: "uthano-api-collection"
  },
  variable: [
    { key: "base_url", value: "http://localhost:8000/api/v1", type: "string" },
    { key: "docker_url", value: "http://localhost:80/api/v1", type: "string" },
    { key: "token", value: "", type: "string" },
    { key: "product_id", value: "1", type: "string" },
    { key: "farmer_id", value: "1", type: "string" },
    { key: "farm_id", value: "1", type: "string" },
    { key: "harvest_id", value: "1", type: "string" },
    { key: "warehouse_id", value: "1", type: "string" },
    { key: "inventory_id", value: "1", type: "string" },
    { key: "quality_check_id", value: "1", type: "string" },
    { key: "review_id", value: "1", type: "string" },
    { key: "coupon_id", value: "1", type: "string" },
    { key: "packaging_type_id", value: "1", type: "string" },
    { key: "packaging_item_id", value: "1", type: "string" },
    { key: "delivery_agent_id", value: "1", type: "string" },
    { key: "delivery_zone_id", value: "1", type: "string" },
    { key: "delivery_id", value: "1", type: "string" },
    { key: "order_id", value: "1", type: "string" },
    { key: "notification_id", value: "1", type: "string" },
    { key: "address_id", value: "1", type: "string" },
    { key: "category_id", value: "1", type: "string" },
    { key: "customer_id", value: "1", type: "string" },
    { key: "audit_log_id", value: "1", type: "string" },
    { key: "sourcing_id", value: "1", type: "string" }
  ],
  item: []
};

// Helper to create a request item
function req(name, method, urlPath, { auth = false, body = null, query = [] } = {}) {
  const headers = [];
  if (auth) headers.push({ key: "Authorization", value: "Bearer {{token}}" });
  if (body) headers.push({ key: "Content-Type", value: "application/json" });

  const url = {
    raw: "{{base_url}}/" + urlPath,
    host: ["{{base_url}}"],
    path: urlPath.split("/")
  };
  if (query.length > 0) url.query = query;

  const r = {
    name,
    request: { method, header: headers, url }
  };
  if (body) r.request.body = { mode: "raw", raw: body };
  r.response = [];
  return r;
}

// Helper for folder
function folder(name, items) {
  return { name, item: items };
}

// ─── API Info ────────────────────────────────────────
collection.item.push(folder("API Info", [
  req("API Health Check", "GET", "")
]));

// ─── Auth ──────────────────────────────────────────────
collection.item.push(folder("Auth", [
  req("Register", "POST", "auth/register", {
    body: JSON.stringify({
      name: "Test User",
      email: "test@example.com",
      password: "password",
      password_confirmation: "password",
      phone: "01700000001"
    }, null, 2)
  }),
  req("Login", "POST", "auth/login", {
    body: JSON.stringify({
      email: "admin@uthano.com",
      password: "password"
    }, null, 2)
  }),
  req("Logout", "POST", "auth/logout", { auth: true }),
  req("Get Profile (Me)", "GET", "auth/me", { auth: true })
]));

// ─── Categories ────────────────────────────────────────
collection.item.push(folder("Categories", [
  req("List Categories", "GET", "categories", {
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" },
      { key: "active_only", value: "true" }
    ]
  }),
  req("View Category by Slug", "GET", "categories/fresh-fruits")
]));

// ─── Products (Public) ─────────────────────────────────
collection.item.push(folder("Products (Public)", [
  req("List Products (Public)", "GET", "products", {
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("View Product by ID (Public)", "GET", "products/1"),
  req("View Product by Slug (Public)", "GET", "products/fresh-mango")
]));

// ─── Customer Profile ──────────────────────────────────
collection.item.push(folder("Customer Profile", [
  req("Get Customer Profile", "GET", "customer/profile", { auth: true }),
  req("Update Customer Profile", "PUT", "customer/profile", {
    auth: true,
    body: JSON.stringify({
      full_name: "Updated Name",
      phone: "01700000001",
      alternate_phone: "01700000002"
    }, null, 2)
  })
]));

// ─── Customer Addresses ────────────────────────────────
collection.item.push(folder("Customer Addresses", [
  req("List Addresses", "GET", "customer/addresses", { auth: true }),
  req("Create Address", "POST", "customer/addresses", {
    auth: true,
    body: JSON.stringify({
      name: "Home",
      phone: "01700000001",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Dhanmondi",
      area: "House 12, Road 5",
      address_line: "House 12, Road 5, Dhanmondi, Dhaka",
      postal_code: "1209",
      latitude: 23.7535,
      longitude: 90.3945,
      address_type: "HOME",
      is_default: true
    }, null, 2)
  }),
  req("Update Address", "PUT", "customer/addresses/{{address_id}}", {
    auth: true,
    body: JSON.stringify({
      name: "Office",
      phone: "01700000002",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Gulshan",
      address_line: "House 12, Road 5, Gulshan, Dhaka",
      postal_code: "1212",
      address_type: "OFFICE",
      is_default: false
    }, null, 2)
  }),
  req("Delete Address", "DELETE", "customer/addresses/{{address_id}}", { auth: true })
]));

// ─── Cart ──────────────────────────────────────────────
collection.item.push(folder("Cart", [
  req("View Cart", "GET", "cart", { auth: true }),
  req("Add to Cart", "POST", "cart/items", {
    auth: true,
    body: JSON.stringify({
      product_id: 1,
      quantity: 2
    }, null, 2)
  }),
  req("Update Cart Item", "PUT", "cart/items/1", {
    auth: true,
    body: JSON.stringify({
      product_id: 1,
      quantity: 5
    }, null, 2)
  }),
  req("Remove Cart Item", "DELETE", "cart/items/1", { auth: true }),
  req("Clear Cart", "DELETE", "cart", { auth: true })
]));

// ─── Orders (Customer) ─────────────────────────────────
collection.item.push(folder("Orders (Customer)", [
  req("List My Orders", "GET", "orders", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Order", "POST", "orders", {
    auth: true,
    body: JSON.stringify({
      address_id: 1,
      items: [
        { product_id: 1, quantity: 2 }
      ],
      payment_method: "COD",
      notes: "Please deliver after 5pm",
      warehouse_id: 1
    }, null, 2)
  }),
  req("View Order", "GET", "orders/{{order_id}}", { auth: true }),
  req("Cancel Order", "POST", "orders/{{order_id}}/cancel", {
    auth: true,
    body: JSON.stringify({
      reason: "Changed my mind"
    }, null, 2)
  })
]));

// ─── Notifications ─────────────────────────────────────
collection.item.push(folder("Notifications", [
  req("List Notifications", "GET", "notifications", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("View Notification", "GET", "notifications/{{notification_id}}", { auth: true }),
  req("Mark Notification as Read", "POST", "notifications/{{notification_id}}/read", { auth: true }),
  req("Mark All Notifications as Read", "POST", "notifications/read-all", { auth: true }),
  req("Get Unread Count", "GET", "notifications/unread-count", { auth: true }),
  req("Delete Notification", "DELETE", "notifications/{{notification_id}}", { auth: true }),
  req("Delete All Notifications", "DELETE", "notifications", { auth: true })
]));

// ─── Farmer Portal ─────────────────────────────────────
collection.item.push(folder("Farmer Portal", [
  req("Farmer Dashboard", "GET", "farmer/dashboard", { auth: true }),
  req("Farmer Farms", "GET", "farmer/farms", { auth: true }),
  req("Farmer Harvests", "GET", "farmer/harvests", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Farmer Sourcing Records", "GET", "farmer/sourcing-records", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Farmer Earnings", "GET", "farmer/earnings", { auth: true })
]));

// ─── Admin - Dashboard ─────────────────────────────────
collection.item.push(folder("Admin - Dashboard", [
  req("Dashboard Summary", "GET", "admin/dashboard", { auth: true })
]));

// ─── Admin - Products ──────────────────────────────────
collection.item.push(folder("Admin - Products", [
  req("Create Product (Admin)", "POST", "admin/products", {
    auth: true,
    body: JSON.stringify({
      category_id: 1,
      unit_id: 1,
      name: "Fresh Mango",
      slug: "fresh-mango",
      description: "Premium fresh mangoes from local farms",
      short_description: "Sweet and juicy mangoes",
      sku: "UTH-MANGO-001",
      product_type: "FRESH",
      base_price: 80,
      selling_price: 100,
      cost_price: 60,
      minimum_order_quantity: 1,
      maximum_order_quantity: 100,
      stock_tracking: true,
      is_featured: true,
      is_active: true,
      status: "ACTIVE"
    }, null, 2)
  }),
  req("Update Product (Admin)", "PUT", "admin/products/{{product_id}}", {
    auth: true,
    body: JSON.stringify({
      name: "Updated Mango",
      selling_price: 120,
      status: "ACTIVE"
    }, null, 2)
  }),
  req("Delete Product (Admin)", "DELETE", "admin/products/{{product_id}}", { auth: true })
]));

// ─── Admin - Farmers ───────────────────────────────────
collection.item.push(folder("Admin - Farmers", [
  req("List Farmers", "GET", "admin/farmers", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Farmer", "POST", "admin/farmers", {
    auth: true,
    body: JSON.stringify({
      user_id: 1,
      full_name: "Rahim Ahmed",
      phone: "01700000002",
      alternate_phone: "01700000003",
      national_id: "1234567890",
      status: "ACTIVE",
      verification_status: "VERIFIED",
      notes: "Verified farmer"
    }, null, 2)
  }),
  req("View Farmer", "GET", "admin/farmers/{{farmer_id}}", { auth: true }),
  req("Update Farmer", "PUT", "admin/farmers/{{farmer_id}}", {
    auth: true,
    body: JSON.stringify({
      full_name: "Updated Name",
      phone: "01700000002",
      status: "ACTIVE",
      verification_status: "VERIFIED"
    }, null, 2)
  }),
  req("Delete Farmer", "DELETE", "admin/farmers/{{farmer_id}}", { auth: true })
]));

// ─── Admin - Farms ─────────────────────────────────────
collection.item.push(folder("Admin - Farms", [
  req("List Farms", "GET", "admin/farms", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Farm", "POST", "admin/farms", {
    auth: true,
    body: JSON.stringify({
      farmer_id: 1,
      farm_name: "Rahim Agro Farm",
      division: "Khulna",
      district: "Jhenaidah",
      upazila: "Kaliganj",
      union: "Barobazar",
      village: "Barobazar",
      address: "Village Barobazar, Kaliganj, Jhenaidah",
      latitude: 23.5446,
      longitude: 89.2959,
      land_area: 5.5,
      land_area_unit: "bigha",
      soil_type: "Clay",
      irrigation_type: "Tube well",
      farming_method: "Organic",
      status: "ACTIVE",
      verification_status: "VERIFIED",
      notes: "Good quality farm"
    }, null, 2)
  }),
  req("View Farm", "GET", "admin/farms/{{farm_id}}", { auth: true }),
  req("Update Farm", "PUT", "admin/farms/{{farm_id}}", {
    auth: true,
    body: JSON.stringify({
      farm_name: "Updated Farm Name",
      status: "ACTIVE"
    }, null, 2)
  }),
  req("Delete Farm", "DELETE", "admin/farms/{{farm_id}}", { auth: true })
]));

// ─── Admin - Harvests ──────────────────────────────────
collection.item.push(folder("Admin - Harvests", [
  req("List Harvests", "GET", "admin/harvests", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Harvest", "POST", "admin/harvests", {
    auth: true,
    body: JSON.stringify({
      farm_id: 1,
      farm_crop_id: 1,
      product_id: 1,
      harvest_date: "2026-08-10",
      estimated_quantity: 500,
      actual_quantity: 500,
      quantity_unit_id: 1,
      quality_grade: "A",
      status: "BATCHED",
      notes: "Good harvest"
    }, null, 2)
  }),
  req("View Harvest", "GET", "admin/harvests/{{harvest_id}}", { auth: true }),
  req("Update Harvest", "PUT", "admin/harvests/{{harvest_id}}", {
    auth: true,
    body: JSON.stringify({
      actual_quantity: 550,
      quality_grade: "A+",
      status: "BATCHED"
    }, null, 2)
  }),
  req("Delete Harvest", "DELETE", "admin/harvests/{{harvest_id}}", { auth: true })
]));

// ─── Admin - Sourcing Records ──────────────────────────
collection.item.push(folder("Admin - Sourcing Records", [
  req("List Sourcing Records", "GET", "admin/sourcing-records", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Sourcing Record", "POST", "admin/sourcing-records", {
    auth: true,
    body: JSON.stringify({
      farmer_id: 1,
      farm_id: 1,
      harvest_batch_id: 1,
      product_id: 1,
      quantity: 500,
      unit_id: 1,
      purchase_price: 80,
      transport_cost: 500,
      packaging_cost: 100,
      other_cost: 50,
      sourced_at: "2026-08-10",
      warehouse_id: 1,
      notes: "Fresh harvest"
    }, null, 2)
  }),
  req("View Sourcing Record", "GET", "admin/sourcing-records/{{sourcing_id}}", { auth: true }),
  req("Receive Sourcing Record", "POST", "admin/sourcing-records/{{sourcing_id}}/receive", { auth: true }),
  req("Delete Sourcing Record", "DELETE", "admin/sourcing-records/{{sourcing_id}}", { auth: true })
]));

// ─── Admin - Warehouses ────────────────────────────────
collection.item.push(folder("Admin - Warehouses", [
  req("List Warehouses", "GET", "admin/warehouses", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Warehouse", "POST", "admin/warehouses", {
    auth: true,
    body: JSON.stringify({
      name: "Dhaka Central Warehouse",
      type: "WAREHOUSE",
      address: "123, Tejgaon Industrial Area, Dhaka",
      district: "Dhaka",
      area: "Tejgaon",
      latitude: 23.7465,
      longitude: 90.3965,
      manager_id: 1,
      status: "ACTIVE"
    }, null, 2)
  }),
  req("View Warehouse", "GET", "admin/warehouses/{{warehouse_id}}", { auth: true }),
  req("Update Warehouse", "PUT", "admin/warehouses/{{warehouse_id}}", {
    auth: true,
    body: JSON.stringify({
      name: "Updated Warehouse Name",
      status: "ACTIVE"
    }, null, 2)
  }),
  req("Delete Warehouse", "DELETE", "admin/warehouses/{{warehouse_id}}", { auth: true })
]));

// ─── Admin - Inventory ─────────────────────────────────
collection.item.push(folder("Admin - Inventory", [
  req("List Inventory Items", "GET", "admin/inventory", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("View Inventory Item", "GET", "admin/inventory/{{inventory_id}}", { auth: true }),
  req("List Inventory Movements", "GET", "admin/inventory/{{inventory_id}}/movements", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Adjust Inventory", "POST", "admin/inventory/{{inventory_id}}/adjust", {
    auth: true,
    body: JSON.stringify({
      quantity: 10,
      movement_type: "ADJUSTMENT",
      notes: "Manual adjustment"
    }, null, 2)
  }),
  req("Transfer Inventory", "POST", "admin/inventory/transfer", {
    auth: true,
    body: JSON.stringify({
      inventory_item_id: 1,
      from_warehouse_id: 1,
      to_warehouse_id: 2,
      quantity: 50,
      notes: "Transfer to Dhaka hub"
    }, null, 2)
  }),
  req("Get Traceability", "GET", "admin/traceability/1", { auth: true })
]));

// ─── Admin - Quality Checks ────────────────────────────
collection.item.push(folder("Admin - Quality Checks", [
  req("List Quality Checks", "GET", "admin/quality-checks", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Quality Check", "POST", "admin/quality-checks", {
    auth: true,
    body: JSON.stringify({
      product_id: 1,
      harvest_batch_id: 1,
      warehouse_id: 1,
      appearance: "Good",
      freshness: "Fresh",
      damaged_quantity: 5,
      accepted_quantity: 495,
      rejected_quantity: 0,
      grade: "A",
      status: "PENDING",
      notes: "Quality check passed"
    }, null, 2)
  }),
  req("View Quality Check", "GET", "admin/quality-checks/{{quality_check_id}}", { auth: true }),
  req("Update Quality Check", "PUT", "admin/quality-checks/{{quality_check_id}}", {
    auth: true,
    body: JSON.stringify({
      appearance: "Excellent",
      freshness: "Very Fresh",
      damaged_quantity: 2,
      accepted_quantity: 498,
      rejected_quantity: 0,
      grade: "A+",
      status: "APPROVED",
      notes: "Updated quality check"
    }, null, 2)
  }),
  req("Delete Quality Check", "DELETE", "admin/quality-checks/{{quality_check_id}}", { auth: true }),
  req("Approve Quality Check", "POST", "admin/quality-checks/{{quality_check_id}}/approve", { auth: true }),
  req("Reject Quality Check", "POST", "admin/quality-checks/{{quality_check_id}}/reject", {
    auth: true,
    body: JSON.stringify({
      reason: "Damaged produce"
    }, null, 2)
  })
]));

// ─── Admin - Product Reviews ───────────────────────────
collection.item.push(folder("Admin - Product Reviews", [
  req("List Product Reviews", "GET", "admin/product-reviews", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Product Review", "POST", "admin/product-reviews", {
    auth: true,
    body: JSON.stringify({
      product_id: 1,
      order_id: 1,
      order_item_id: 1,
      rating: 5,
      title: "Excellent product",
      comment: "Fresh and delicious mangoes!",
      status: "PENDING"
    }, null, 2)
  }),
  req("View Product Review", "GET", "admin/product-reviews/{{review_id}}", { auth: true }),
  req("Update Product Review", "PUT", "admin/product-reviews/{{review_id}}", {
    auth: true,
    body: JSON.stringify({
      rating: 4,
      title: "Updated review title",
      comment: "Good product overall",
      status: "APPROVED"
    }, null, 2)
  }),
  req("Delete Product Review", "DELETE", "admin/product-reviews/{{review_id}}", { auth: true }),
  req("Approve Product Review", "POST", "admin/product-reviews/{{review_id}}/approve", { auth: true }),
  req("Reject Product Review", "POST", "admin/product-reviews/{{review_id}}/reject", {
    auth: true,
    body: JSON.stringify({
      reason: "Inappropriate content"
    }, null, 2)
  })
]));

// ─── Admin - Coupons ───────────────────────────────────
collection.item.push(folder("Admin - Coupons", [
  req("List Coupons", "GET", "admin/coupons", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Coupon", "POST", "admin/coupons", {
    auth: true,
    body: JSON.stringify({
      code: "UTH10",
      type: "PERCENTAGE",
      value: 10,
      minimum_order_amount: 500,
      maximum_discount: 100,
      start_at: "2026-01-01",
      end_at: "2026-12-31",
      usage_limit: 100,
      per_customer_limit: 1,
      is_active: true
    }, null, 2)
  }),
  req("View Coupon", "GET", "admin/coupons/{{coupon_id}}", { auth: true }),
  req("Update Coupon", "PUT", "admin/coupons/{{coupon_id}}", {
    auth: true,
    body: JSON.stringify({
      code: "UTH15",
      type: "PERCENTAGE",
      value: 15,
      minimum_order_amount: 300,
      maximum_discount: 150,
      start_at: "2026-01-01",
      end_at: "2026-12-31",
      usage_limit: 200,
      per_customer_limit: 2,
      is_active: true
    }, null, 2)
  }),
  req("Delete Coupon", "DELETE", "admin/coupons/{{coupon_id}}", { auth: true }),
  req("Toggle Coupon Status", "POST", "admin/coupons/{{coupon_id}}/toggle", { auth: true })
]));

// ─── Admin - Packaging Types ───────────────────────────
collection.item.push(folder("Admin - Packaging Types", [
  req("List Packaging Types", "GET", "admin/packaging-types", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Packaging Type", "POST", "admin/packaging-types", {
    auth: true,
    body: JSON.stringify({
      name: "Cardboard Box",
      code: "BOX-001",
      description: "Standard cardboard box for produce",
      capacity: 10,
      capacity_unit: "kg",
      is_reusable: true,
      is_active: true
    }, null, 2)
  }),
  req("View Packaging Type", "GET", "admin/packaging-types/{{packaging_type_id}}", { auth: true }),
  req("Update Packaging Type", "PUT", "admin/packaging-types/{{packaging_type_id}}", {
    auth: true,
    body: JSON.stringify({
      name: "Updated Box Name",
      code: "BOX-001",
      description: "Updated description",
      capacity: 15,
      capacity_unit: "kg",
      is_reusable: true,
      is_active: true
    }, null, 2)
  }),
  req("Delete Packaging Type", "DELETE", "admin/packaging-types/{{packaging_type_id}}", { auth: true }),
  req("Toggle Packaging Type Status", "POST", "admin/packaging-types/{{packaging_type_id}}/toggle", { auth: true })
]));

// ─── Admin - Packaging Items ───────────────────────────
collection.item.push(folder("Admin - Packaging Items", [
  req("List Packaging Items", "GET", "admin/packaging-items", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Packaging Item", "POST", "admin/packaging-items", {
    auth: true,
    body: JSON.stringify({
      packaging_type_id: 1,
      warehouse_id: 1,
      code: "ITEM-001",
      status: "AVAILABLE",
      current_quantity: 100,
      notes: "Initial stock"
    }, null, 2)
  }),
  req("View Packaging Item", "GET", "admin/packaging-items/{{packaging_item_id}}", { auth: true }),
  req("Update Packaging Item", "PUT", "admin/packaging-items/{{packaging_item_id}}", {
    auth: true,
    body: JSON.stringify({
      packaging_type_id: 1,
      warehouse_id: 1,
      code: "ITEM-001",
      status: "IN_USE",
      current_quantity: 95,
      notes: "Updated notes"
    }, null, 2)
  }),
  req("Delete Packaging Item", "DELETE", "admin/packaging-items/{{packaging_item_id}}", { auth: true }),
  req("List Packaging Item Movements", "GET", "admin/packaging-items/{{packaging_item_id}}/movements", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  })
]));

// ─── Admin - Delivery Agents ───────────────────────────
collection.item.push(folder("Admin - Delivery Agents", [
  req("List Delivery Agents", "GET", "admin/delivery-agents", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Delivery Agent", "POST", "admin/delivery-agents", {
    auth: true,
    body: JSON.stringify({
      user_id: 1,
      agent_code: "AGENT-001",
      phone: "01700000005",
      vehicle_type: "Motorcycle",
      vehicle_number: "DHK-1234",
      status: "ACTIVE"
    }, null, 2)
  }),
  req("View Delivery Agent", "GET", "admin/delivery-agents/{{delivery_agent_id}}", { auth: true }),
  req("Update Delivery Agent", "PUT", "admin/delivery-agents/{{delivery_agent_id}}", {
    auth: true,
    body: JSON.stringify({
      user_id: 1,
      agent_code: "AGENT-001",
      phone: "01700000005",
      vehicle_type: "Motorcycle",
      vehicle_number: "DHK-1234",
      status: "ACTIVE"
    }, null, 2)
  }),
  req("Delete Delivery Agent", "DELETE", "admin/delivery-agents/{{delivery_agent_id}}", { auth: true }),
  req("Toggle Delivery Agent Status", "POST", "admin/delivery-agents/{{delivery_agent_id}}/toggle", { auth: true })
]));

// ─── Admin - Delivery Zones ────────────────────────────
collection.item.push(folder("Admin - Delivery Zones", [
  req("List Delivery Zones", "GET", "admin/delivery-zones", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Delivery Zone", "POST", "admin/delivery-zones", {
    auth: true,
    body: JSON.stringify({
      name: "Dhaka North",
      district: "Dhaka",
      area: "North Dhaka",
      base_charge: 50,
      weight_based_charge: 10,
      status: "ACTIVE"
    }, null, 2)
  }),
  req("View Delivery Zone", "GET", "admin/delivery-zones/{{delivery_zone_id}}", { auth: true }),
  req("Update Delivery Zone", "PUT", "admin/delivery-zones/{{delivery_zone_id}}", {
    auth: true,
    body: JSON.stringify({
      name: "Updated Zone Name",
      district: "Dhaka",
      area: "North Dhaka",
      base_charge: 60,
      weight_based_charge: 12,
      status: "ACTIVE"
    }, null, 2)
  }),
  req("Delete Delivery Zone", "DELETE", "admin/delivery-zones/{{delivery_zone_id}}", { auth: true }),
  req("Toggle Delivery Zone Status", "POST", "admin/delivery-zones/{{delivery_zone_id}}/toggle", { auth: true })
]));

// ─── Admin - Deliveries ────────────────────────────────
collection.item.push(folder("Admin - Deliveries", [
  req("List Deliveries", "GET", "admin/deliveries", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("Create Delivery", "POST", "admin/deliveries", {
    auth: true,
    body: JSON.stringify({
      order_id: 1,
      delivery_zone_id: 1,
      pickup_warehouse_id: 1,
      delivery_fee: 50,
      customer_note: "Deliver to back gate"
    }, null, 2)
  }),
  req("View Delivery", "GET", "admin/deliveries/{{delivery_id}}", { auth: true }),
  req("Assign Delivery Agent", "POST", "admin/deliveries/{{delivery_id}}/assign", {
    auth: true,
    body: JSON.stringify({
      delivery_agent_id: 1
    }, null, 2)
  }),
  req("Update Delivery Status", "POST", "admin/deliveries/{{delivery_id}}/status", {
    auth: true,
    body: JSON.stringify({
      status: "PICKED_UP",
      notes: "Package picked up from warehouse"
    }, null, 2)
  })
]));

// ─── Admin - Orders ────────────────────────────────────
collection.item.push(folder("Admin - Orders", [
  req("Confirm Order", "POST", "admin/orders/{{order_id}}/confirm", {
    auth: true,
    body: JSON.stringify({
      warehouse_id: 1
    }, null, 2)
  }),
  req("Update Order Status", "POST", "admin/orders/{{order_id}}/status", {
    auth: true,
    body: JSON.stringify({
      status: "CONFIRMED",
      notes: "Order confirmed by admin"
    }, null, 2)
  })
]));

// ─── Admin - Audit Logs ─────────────────────────────────
collection.item.push(folder("Admin - Audit Logs", [
  req("List Audit Logs", "GET", "admin/audit-logs", {
    auth: true,
    query: [
      { key: "page", value: "1" },
      { key: "per_page", value: "20" }
    ]
  }),
  req("View Audit Log", "GET", "admin/audit-logs/{{audit_log_id}}", { auth: true }),
  req("Delete Audit Log", "DELETE", "admin/audit-logs/{{audit_log_id}}", { auth: true }),
  req("Delete Old Audit Logs", "DELETE", "admin/audit-logs/cleanup", {
    auth: true,
    query: [
      { key: "days", value: "90" }
    ]
  })
]));

// Write the collection to file
const outputPath = path.join(__dirname, 'UTHANO_API_Collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2) + '\n');

console.log('✅ UTHANO API Collection generated successfully!');
console.log(`   Output: ${outputPath}`);
console.log(`   Total folders: ${collection.item.length}`);
const totalRequests = collection.item.reduce((sum, f) => sum + f.item.length, 0);
console.log(`   Total requests: ${totalRequests}`);
