# Database Schema Documentation

## Overview

This document provides a detailed explanation of the database schema for the Babi Procurement Platform.

## Database Design Principles

1. **Normalization**: Schema follows 3NF to minimize redundancy
2. **Flexibility**: JSONField for extensible specifications and metadata
3. **Auditability**: Timestamps and history tracking on all critical tables
4. **Performance**: Strategic indexes on frequently queried fields
5. **Scalability**: Designed to handle growth in organizations, products, and orders

---

## Core Entities

### 1. Users (`users`)

**Purpose**: Custom user model supporting multiple roles (Admin, Procurement Officer, Delivery Staff)

**Key Fields**:
- `email` (unique) - Primary identifier for authentication
- `role` - User role (ADMIN, PROCUREMENT_OFFICER, DELIVERY_STAFF)
- `organization_id` - FK to organization (null for admins)
- `is_verified` - Account verification status

**Why This Design**:
- Email-based authentication is more professional for B2B
- Role-based access control built into the user model
- Flexible enough to support organization-less admin users


**Relationships**:
- One-to-Many with Organization (one org has many users)
- One-to-Many with PasswordResetToken

---

### 2. Organizations (`organizations`)

**Purpose**: Institutional buyers (schools, universities, government offices, NGOs, companies)

**Key Fields**:
- `name` - Organization name
- `organization_type` - Type (SCHOOL, UNIVERSITY, GOVERNMENT, NGO, COMPANY)
- `registration_number` (unique) - Official registration/license number
- `verification_status` - PENDING, VERIFIED, REJECTED, SUSPENDED
- `verified_by_id` - FK to admin user who verified

**Why This Design**:
- Verification workflow is critical for trust and legitimacy
- Different organization types may have different procurement patterns
- Registration number uniqueness prevents duplicate registrations
- Audit trail with verified_by and verified_at

**Relationships**:
- One-to-Many with User
- One-to-Many with DeliveryAddress
- One-to-Many with ProcurementContact
- One-to-Many with Order
- Many-to-Many with Basket (through BasketParticipant)


---

### 3. Products (`products`)

**Purpose**: Stationery products available for procurement

**Key Fields**:
- `sku` (unique) - Stock Keeping Unit for inventory management
- `category_id` - FK to Category
- `specifications` (JSON) - Flexible product specifications
- `unit_of_measure` - piece, ream, box, carton, dozen
- `units_per_package` - Number of units in one package
- `minimum_order_quantity` - Minimum quantity that can be ordered

**Why This Design**:
- SKU system allows barcode integration and inventory tracking
- JSONField for specifications handles diverse product attributes
- Packaging information critical for wholesale pricing
- Minimum order quantity enforces wholesale requirements

**Relationships**:
- Many-to-One with Category
- One-to-Many with ProductImage
- One-to-Many with PriceHistory
- Many-to-Many with Supplier (through SupplierProduct)
- Many-to-Many with Basket (through BasketProduct)

---

### 4. Categories (`categories`)

**Purpose**: Hierarchical product categorization

**Key Fields**:
- `parent_id` - Self-referencing FK for hierarchy (nullable)
- `slug` (unique) - URL-friendly identifier
- `display_order` - Controls sorting in UI

**Why This Design**:
- Self-referencing allows unlimited category depth
- Slug enables SEO-friendly URLs
- Display order gives admins control over category presentation


---

### 5. Suppliers (`suppliers`)

**Purpose**: Wholesale suppliers (primarily from Merkato)

**Key Fields**:
- `supplier_type` - WHOLESALER, MANUFACTURER, DISTRIBUTOR
- `merkato_location` - Specific area within Merkato
- `rating` - Performance rating (0-5)
- `total_orders` / `successful_deliveries` - Performance metrics
- `is_verified` - Supplier verification status

**Why This Design**:
- Merkato-specific location helps with logistics planning
- Performance tracking (rating, total_orders, successful_deliveries) enables supplier ranking
- Verification ensures quality control
- Banking info for payment processing

**Relationships**:
- One-to-Many with SupplierContact
- One-to-Many with SupplierProduct
- One-to-Many with OrderItem

---

### 6. SupplierProduct (`supplier_products`)

**Purpose**: Junction table linking suppliers to products with supplier-specific data

**Key Fields**:
- `supplier_id` + `product_id` (unique together)
- `unit_price` - Supplier's current price
- `minimum_order_quantity` - Supplier's MOQ
- `lead_time_days` - Fulfillment time
- `is_preferred` - Preferred supplier for this product

**Why This Design**:
- One product can be supplied by multiple suppliers at different prices
- Tracks supplier-specific pricing and terms
- `is_preferred` enables automatic supplier selection
- Historical tracking of when supplier last provided product


---

## Basket System (Core Feature)

### 7. Baskets (`baskets`)

**Purpose**: The heart of the platform - procurement baskets where organizations pool orders

**Key Fields**:
- `basket_type` - WEEKLY, MONTHLY, SIX_MONTH
- `status` - DRAFT, OPEN, CLOSING_SOON, CLOSED, PROCUREMENT, DELIVERED, CANCELLED
- `opens_at` / `closes_at` - Time window for orders
- `target_participants` - Goal for participation
- `current_participants` - Calculated participation count
- `price_tiers` (JSON) - Discount milestones based on participation
- `total_estimated_value` - Running total of all orders
- `total_final_value` - Final locked-in value when basket closes

**Why This Design**:
- Status field enables workflow management
- Time-bound windows create urgency and enable batch processing
- JSON price_tiers allow flexible discount structures defined by admins
- Separation of estimated vs. final value tracks price changes

**Example price_tiers JSON**:
```json
[
  {"min_participants": 5, "discount_percent": 5},
  {"min_participants": 10, "discount_percent": 10},
  {"min_participants": 20, "discount_percent": 15}
]
```

**Relationships**:
- One-to-Many with BasketProduct
- One-to-Many with BasketParticipant
- One-to-Many with Order
- One-to-Many with PriceHistory


---

### 8. BasketProduct (`basket_products`)

**Purpose**: Products included in a specific basket with dynamic pricing

**Key Fields**:
- `basket_id` + `product_id` (unique together)
- `supplier_id` - Selected supplier for this basket/product combination
- `base_price` - Starting price
- `current_estimated_price` - Updates as basket fills
- `final_price` - Locked when basket closes
- `total_quantity_ordered` - Aggregated quantity from all orders

**Why This Design**:
- Each basket can select different suppliers for the same product
- Three price fields track the dynamic pricing journey:
  - `base_price`: Starting point
  - `current_estimated_price`: Changes as more orgs join
  - `final_price`: Locked in when basket closes
- `total_quantity_ordered` enables bulk pricing calculations
- Unique constraint prevents duplicate products in same basket

---

### 9. BasketParticipant (`basket_participants`)

**Purpose**: Tracks which organizations are participating in which baskets

**Key Fields**:
- `basket_id` + `organization_id` (unique together)
- `joined_at` - When organization joined
- `has_placed_order` - Whether they've actually ordered
- `total_order_value` - Sum of their orders in this basket

**Why This Design**:
- Separates "joining" from "ordering" - orgs can browse before committing
- Enables calculation of current_participants for discount tiers
- Tracks order summary per organization for basket analytics
- Useful for targeted notifications to basket participants


---

## Order Management

### 10. Orders (`orders`)

**Purpose**: Individual orders from organizations (basket or direct purchase)

**Key Fields**:
- `order_number` (unique) - Human-readable order identifier
- `order_type` - BASKET or DIRECT
- `basket_id` - FK to basket (nullable for direct orders)
- `organization_id` - FK to organization
- `status` - Order lifecycle (DRAFT → DELIVERED)
- `subtotal`, `discount_amount`, `tax_amount`, `delivery_fee`, `total_amount`
- `estimated_savings` - Compared to retail/previous basket prices
- `placed_by_id` / `confirmed_by_id` - User tracking

**Why This Design**:
- Supports both basket and direct purchase workflows
- Comprehensive pricing breakdown for transparency
- Estimated savings calculation is a key platform value proposition
- Status tracking enables workflow automation and notifications
- User attribution (placed_by, confirmed_by) for accountability

**Relationships**:
- Many-to-One with Organization
- Many-to-One with Basket (nullable)
- Many-to-One with DeliveryAddress
- One-to-Many with OrderItem
- One-to-Many with OrderStatusHistory
- Many-to-Many with Delivery (through DeliveryOrder)

---

### 11. OrderItem (`order_items`)

**Purpose**: Line items within an order

**Key Fields**:
- `order_id` + line number
- `product_id`, `supplier_id`
- `basket_product_id` - Links to basket product (nullable for direct orders)
- `quantity`, `unit_price`, `line_total`
- `original_price` - For savings calculation

**Why This Design**:
- Denormalized pricing (unit_price, line_total) preserves historical data
- `original_price` enables savings calculation
- `basket_product_id` link maintains basket context
- Supplier tracking at line-item level supports multi-supplier orders


---

## Price Intelligence System

### 12. PriceHistory (`price_history`)

**Purpose**: Historical pricing data - the foundation of market intelligence

**Key Fields**:
- `product_id` - FK to product
- `price` - Price value
- `price_type` - WHOLESALE, RETAIL, BASKET, DIRECT, MARKET_SURVEY
- `supplier_id` / `basket_id` - Source context
- `effective_date` - When this price was valid
- `quantity` - Quantity at which this price was available

**Why This Design**:
- Multiple price types enable comprehensive market view
- `effective_date` is indexed for fast time-series queries
- Quantity tracking reveals volume-based pricing patterns
- Basket and supplier links provide price source transparency
- This data powers:
  - 2-year price history charts
  - Seasonal trend identification
  - "Best time to buy" recommendations
  - Savings calculations

**Index Strategy**:
- Composite index on (product_id, effective_date) for chart queries
- Composite index on (product_id, price_type, effective_date) for filtered views

---

### 13. PriceAnalytics (`price_analytics`)

**Purpose**: Pre-computed price statistics for dashboard performance

**Key Fields**:
- `product_id` + `period_type` + `period_start` (unique together)
- `period_type` - WEEKLY, MONTHLY, QUARTERLY, YEARLY
- `min_price`, `max_price`, `avg_price`, `median_price`
- `price_change`, `price_change_percent` - vs. previous period
- `price_volatility` - Standard deviation

**Why This Design**:
- Pre-computation avoids expensive aggregation queries
- Enables instant dashboard loading even with 2 years of data
- Calculated periodically via background job (celery/cron)
- Period types support different analysis granularities


---

### 14. PriceTrend (`price_trends`)

**Purpose**: Identified price patterns and trends

**Key Fields**:
- `product_id`
- `trend_type` - SEASONAL_HIGH, SEASONAL_LOW, UPWARD_TREND, DOWNWARD_TREND, STABLE, VOLATILE
- `start_date` / `end_date` - Trend period
- `description` - Human-readable explanation
- `confidence_score` - Statistical confidence (0-100)
- `supporting_data` (JSON) - Additional analysis data

**Why This Design**:
- Identified by background analytics jobs
- Human-readable descriptions shown to users
- Confidence score allows filtering low-quality predictions
- JSON field stores flexible supporting evidence

---

### 15. MarketInsight (`market_insights`)

**Purpose**: Actionable recommendations for procurement officers

**Key Fields**:
- `product_id` / `category_id` - Can target specific product or entire category
- `insight_type` - SEASONAL, BEST_TIME_TO_BUY, PRICE_ALERT, SAVINGS_OPPORTUNITY
- `title`, `description`, `recommendation`
- `valid_from` / `valid_until` - Time-bound relevance

**Why This Design**:
- Can be product-specific or category-wide
- Time-bound validity allows seasonal insights
- Priority field controls display order
- Examples:
  - "Prices typically rise 15% before school year (July-August)"
  - "Current prices are 8% below yearly average - good time to stock up"
  - "Exercise book prices are at 2-year low"


---

## Delivery Management

### 16. Deliveries (`deliveries`)

**Purpose**: Delivery logistics and tracking

**Key Fields**:
- `delivery_number` (unique)
- `basket_id` - Associated basket (nullable for direct orders)
- `status` - SCHEDULED, IN_TRANSIT, DELIVERED, FAILED, CANCELLED
- `scheduled_date` / `actual_delivery_date`
- `driver_id` - FK to User (DELIVERY_STAFF role)
- `route_order` - Position in delivery route
- Proof of delivery: `received_by_name`, `received_by_signature`, `delivery_photo`

**Why This Design**:
- Can group multiple orders for efficiency
- Route optimization supported via `route_order`
- Digital proof of delivery (signature + photo) for accountability
- Driver assignment enables mobile app integration (future)
- Distance tracking helps with cost calculation

**Relationships**:
- Many-to-Many with Order (through DeliveryOrder)
- Many-to-One with Basket
- Many-to-One with User (driver)

---

### 17. DeliveryOrder (`delivery_orders`)

**Purpose**: Maps orders to deliveries (many-to-many)

**Key Fields**:
- `delivery_id` + `order_id` (unique together)
- `is_delivered` - Per-order delivery status
- `has_issues` - Flag for delivery problems

**Why This Design**:
- One delivery can contain multiple orders (efficient routing)
- One order could theoretically be split across multiple deliveries
- Issue tracking at order level, not just delivery level


---

## Notifications and Communication

### 18. Notifications (`notifications`)

**Purpose**: User notifications for important events

**Key Fields**:
- `user_id`, `organization_id`
- `notification_type` - BASKET_OPENED, BASKET_CLOSING_SOON, DISCOUNT_UNLOCKED, ORDER_CONFIRMED, etc.
- `title`, `message`
- Related object FKs: `basket_id`, `order_id`, `delivery_id`
- `action_url` - Deep link to relevant page
- `is_read`, `read_at`
- `sent_via_email`, `email_sent_at`

**Why This Design**:
- Typed notifications enable custom styling/icons in UI
- Optional FKs to related objects enable "view details" links
- Email integration for critical notifications
- Organization FK allows org-wide notifications
- Read tracking for notification badge counts

**Index Strategy**:
- Composite index on (user_id, is_read, created_at) for "unread notifications" query

---

### 19. Announcements (`announcements`)

**Purpose**: Platform-wide or organization-specific announcements

**Key Fields**:
- `target_audience` - ALL, ORGANIZATIONS, ADMINS, SPECIFIC_ORG
- `target_organization_id` - For organization-specific announcements
- `is_pinned` - Sticky announcements
- `show_banner` - Display as banner on dashboard
- `valid_from` / `valid_until` - Time-bound display

**Why This Design**:
- Flexible targeting (platform-wide or specific org)
- Pinned announcements always visible
- Banner option for urgent messages
- Time-bound validity for seasonal/temporary announcements


---

## Supporting Tables

### 20. DeliveryAddress (`delivery_addresses`)
- Organizations can have multiple delivery addresses
- One default address per organization
- Contact person information for each location

### 21. ProcurementContact (`procurement_contacts`)
- Multiple procurement officers per organization
- One primary contact per organization

### 22. SupplierContact (`supplier_contacts`)
- Multiple contacts per supplier
- One primary contact per supplier

### 23. ProductImage (`product_images`)
- Additional product images beyond primary
- Display order for galleries

### 24. ProductAvailability (`product_availability`)
- Track when products are unavailable
- Shown in price history charts as gaps

### 25. OrderStatusHistory (`order_status_history`)
- Audit trail of all order status changes
- Changed by user tracking

### 26. DeliveryStatusHistory (`delivery_status_history`)
- Audit trail of delivery status changes
- Location tracking at each status change

### 27. PasswordResetToken (`password_reset_tokens`)
- Secure password reset workflow
- Token expiration and usage tracking

### 28. EmailLog (`email_logs`)
- Tracks all emails sent by system
- Status tracking (PENDING, SENT, FAILED, BOUNCED)
- Debugging and compliance


---

## Key Design Decisions & Rationale

### 1. **Denormalized Pricing**
**Decision**: Store price snapshots in OrderItem instead of just FK to current price

**Why**: 
- Preserves historical accuracy even if supplier prices change
- Essential for financial records and auditing
- Enables accurate savings calculations months later

### 2. **Separate Estimated and Final Prices**
**Decision**: BasketProduct has both `current_estimated_price` and `final_price`

**Why**:
- Prices change as basket fills (key platform feature)
- Organizations see real-time price drops as more join
- Final price locked when basket closes prevents post-closure disputes

### 3. **JSON for Flexible Data**
**Decision**: Use JSONField for price_tiers, specifications, supporting_data

**Why**:
- Admin-defined discount structures vary per basket
- Product specifications differ by category (paper vs. pens)
- Avoids creating many sparse columns
- Django's JSONField is indexed and queryable

### 4. **Composite Indexes**
**Decision**: Indexes on (product_id, effective_date), (user_id, is_read, created_at)

**Why**:
- Price history queries always filter by product AND date range
- Notification queries always need user's unread count
- Composite indexes dramatically faster than sequential filters

### 5. **History Tables**
**Decision**: Separate StatusHistory tables for orders and deliveries

**Why**:
- Audit compliance and transparency
- Customer service needs status change history
- Enables analytics on process bottlenecks
- Minimal performance impact (append-only)


### 6. **Three-Layer Price Tracking**
**Decision**: PriceHistory (raw data) → PriceAnalytics (aggregated) → PriceTrend/MarketInsight (interpreted)

**Why**:
- Raw data: Complete historical record
- Analytics: Pre-computed for fast queries
- Trends/Insights: Business intelligence for users
- Each layer optimized for its purpose

### 7. **Basket as Central Entity**
**Decision**: Basket links to products, participants, orders, pricing, deliveries

**Why**:
- Basket is the core platform concept
- Enables basket-wide operations (close, procure, deliver)
- Analytics roll up at basket level
- Preserves basket context even after orders fulfilled

### 8. **Organization Verification Workflow**
**Decision**: verification_status + verified_by + verified_at + verification_notes

**Why**:
- Trust is critical in B2B marketplace
- Full audit trail of who approved/rejected and why
- Legal compliance for institutional transactions
- Prevents fraud and maintains platform reputation

---

## Performance Considerations

### Indexes
- All foreign keys automatically indexed by Django
- Additional indexes on frequently queried fields:
  - `order_number`, `delivery_number` (unique lookups)
  - `(product_id, effective_date)` (time-series queries)
  - `(user_id, is_read, created_at)` (notification lists)
  - `(status, closes_at)` (basket lists)

### Calculated Fields
- `Basket.current_participants` - updated on BasketParticipant changes
- `Basket.total_estimated_value` - updated on Order changes
- `Order.total_amount` - calculated from line items
- Signals/triggers maintain these automatically


### Query Optimization
- PriceAnalytics pre-computed to avoid aggregating years of data
- select_related() for single-object FK lookups
- prefetch_related() for reverse FK and M2M
- Database-level aggregation for reporting queries

---

## Scalability Path

### Current Design Supports:
- Thousands of organizations
- Tens of thousands of products
- Millions of price history records
- Concurrent basket participation

### Future Scaling Options:
1. **Read Replicas**: Read-heavy queries to replicas
2. **Partitioning**: Partition PriceHistory by year
3. **Caching**: Redis for hot data (active baskets, user sessions)
4. **CDN**: Static assets and product images
5. **Background Jobs**: Price analytics, notifications, email
6. **Search Engine**: Elasticsearch for product search
7. **Time-Series DB**: TimescaleDB extension for price data

---

## Data Integrity Constraints

### Database Level
- Foreign key constraints with appropriate ON DELETE behavior
- Unique constraints on business keys (SKU, order_number, email)
- Check constraints on positive decimals (prices, quantities)
- Unique together constraints on junction tables

### Application Level (Django)
- Model validation methods
- Custom save() logic for calculated fields
- Signals for cascade updates
- Transaction management for multi-table operations

---

## Security Considerations

1. **Authentication**: JWT tokens, secure password hashing
2. **Authorization**: Row-level permissions via Django ORM filters
3. **Audit Trail**: created_by, updated_by on sensitive tables
4. **PII Protection**: Email logs separate from core business tables
5. **Encryption**: Database-level encryption at rest (Supabase)
6. **Backups**: Automated daily backups with point-in-time recovery


---

## Summary

This schema is designed to:

✅ **Support Core Features**
- Dynamic basket pricing with real-time updates
- 2-year price history and market intelligence
- Organization verification and multi-address delivery
- Comprehensive order and delivery tracking

✅ **Enable Business Intelligence**
- Price trend analysis and forecasting
- Supplier performance tracking
- Organization spending analytics
- Basket efficiency metrics

✅ **Ensure Data Quality**
- Audit trails on all critical operations
- Denormalized snapshots for historical accuracy
- Comprehensive validation and constraints
- Full transaction history

✅ **Scale Efficiently**
- Strategic indexing for common queries
- Pre-computed analytics for dashboards
- Flexible JSON fields avoid sparse columns
- Clear optimization and partitioning paths

✅ **Maintain Flexibility**
- Support for future features (RFQ, payment tracking)
- Extensible via JSON fields
- Clean separation of concerns
- Well-defined relationships

The schema balances normalization with performance, provides rich audit capabilities, and supports the platform's unique value propositions around group purchasing and price intelligence.
