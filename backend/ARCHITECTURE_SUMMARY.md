# Backend Architecture Summary

## 🎯 What We've Built

A complete Django REST Framework backend for the Babi Stationery Procurement Platform.

## 📁 Project Structure

```
backend/
├── config/                      # Django configuration
│   ├── settings.py             # Main settings (DB, JWT, CORS, REST Framework)
│   ├── urls.py                 # Root URL routing
│   ├── wsgi.py & asgi.py       # Server entry points
│
├── apps/                        # Django applications
│   ├── users/                  # Authentication & user management
│   │   └── models.py          # User, PasswordResetToken
│   │
│   ├── organizations/         # Institutional buyers
│   │   └── models.py         # Organization, DeliveryAddress, ProcurementContact
│   │
│   ├── products/              # Product catalog
│   │   └── models.py         # Product, Category, ProductImage, ProductAvailability
│   │
│   ├── suppliers/             # Merkato wholesale suppliers
│   │   └── models.py         # Supplier, SupplierContact, SupplierProduct
│   │
│   ├── baskets/               # ⭐ Core basket system
│   │   └── models.py         # Basket, BasketProduct, BasketParticipant
│   │
│   ├── orders/                # Order management
│   │   └── models.py         # Order, OrderItem, OrderStatusHistory
│   │
│   ├── pricing/               # ⭐ Price intelligence
│   │   └── models.py         # PriceHistory, PriceAnalytics, PriceTrend, MarketInsight
│   │
│   ├── deliveries/            # Delivery tracking
│   │   └── models.py         # Delivery, DeliveryOrder, DeliveryStatusHistory
│   │
│   └── notifications/         # User notifications
│       └── models.py         # Notification, Announcement, EmailLog
│
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
├── manage.py                 # Django management
├── README.md                 # Setup instructions
├── DATABASE_SCHEMA.md        # Detailed schema documentation
└── SETUP_GUIDE.md           # Quick start guide
```


## 🗄️ Database Models (28 Tables)

### Core Entities
1. **User** - Email-based auth, roles (Admin/Procurement Officer/Delivery Staff)
2. **Organization** - Schools, universities, NGOs, government offices, companies
3. **Product** - Stationery products with SKU, packaging, specifications
4. **Category** - Hierarchical product categorization
5. **Supplier** - Merkato wholesalers with performance tracking

### Basket System (The Heart of the Platform)
6. **Basket** - Weekly/monthly/6-month procurement cycles
7. **BasketProduct** - Products in basket with dynamic pricing
8. **BasketParticipant** - Organizations joining baskets

### Order Management
9. **Order** - Basket orders + direct purchases
10. **OrderItem** - Line items with pricing snapshots
11. **OrderStatusHistory** - Audit trail

### Price Intelligence (Key Differentiator)
12. **PriceHistory** - 2-year historical pricing data
13. **PriceAnalytics** - Pre-computed statistics (min/max/avg)
14. **PriceTrend** - Identified patterns (seasonal, upward, downward)
15. **MarketInsight** - Actionable recommendations

### Delivery System
16. **Delivery** - Delivery scheduling and tracking
17. **DeliveryOrder** - Links deliveries to orders
18. **DeliveryStatusHistory** - Delivery audit trail

### Communication
19. **Notification** - User notifications
20. **Announcement** - Platform-wide announcements
21. **EmailLog** - Email tracking

### Supporting Tables
22. **DeliveryAddress** - Organization delivery locations
23. **ProcurementContact** - Procurement officers
24. **SupplierContact** - Supplier contacts
25. **SupplierProduct** - Supplier-product mapping with pricing
26. **ProductImage** - Product photo galleries
27. **ProductAvailability** - Out-of-stock tracking
28. **PasswordResetToken** - Secure password reset


## 🔑 Key Design Features

### 1. Dynamic Basket Pricing
- **Base Price** → **Estimated Price** → **Final Price**
- Price drops as more organizations join
- Discount tiers configured per basket (JSON)
- Real-time price updates for participants

### 2. Comprehensive Price Intelligence
- **Raw Data**: PriceHistory (every price change recorded)
- **Analytics**: Pre-computed stats for fast dashboards
- **Trends**: AI/manual identification of patterns
- **Insights**: Actionable "best time to buy" recommendations

### 3. Multi-Organization Support
- Each organization can have:
  - Multiple users (procurement officers)
  - Multiple delivery addresses
  - Multiple procurement contacts
- Verification workflow (pending → verified/rejected)

### 4. Flexible Product System
- SKU-based inventory management
- JSONField for extensible specifications
- Multiple images per product
- Availability tracking over time

### 5. Supplier Performance Tracking
- Rating system (0-5)
- Success rate calculation
- Lead time tracking
- Preferred supplier designation

### 6. Audit Trails
- Order status history
- Delivery status history
- User action tracking (created_by, confirmed_by)
- Email logs for compliance

### 7. Smart Notifications
- Typed notifications (basket_opened, order_confirmed, etc.)
- Email integration
- Deep links to relevant pages
- Read/unread tracking


## 🛠️ Technology Stack

- **Framework**: Django 5.0.1
- **API**: Django REST Framework 3.14.0
- **Database**: PostgreSQL / Supabase
- **Authentication**: JWT (djangorestframework-simplejwt)
- **CORS**: django-cors-headers (for React frontend)
- **Filtering**: django-filter
- **Images**: Pillow
- **Config**: python-decouple (environment variables)

## 📊 API Endpoints Structure

```
/api/auth/
  - POST token/              # Login (get JWT)
  - POST token/refresh/      # Refresh JWT

/api/users/
  - GET/POST                 # List/create users
  - GET/PUT/DELETE /:id/     # User detail

/api/organizations/
  - GET/POST                 # List/create organizations
  - GET/PUT/DELETE /:id/     # Organization detail
  - POST /:id/verify/        # Admin verification

/api/products/
  - GET/POST                 # List/create products
  - GET /:id/                # Product detail with price history
  - GET /:id/price-history/  # 2-year price chart data

/api/baskets/
  - GET/POST                 # List/create baskets
  - GET /:id/                # Basket detail with progress
  - POST /:id/join/          # Organization joins basket
  - GET /:id/participants/   # List participants

/api/orders/
  - GET/POST                 # List/create orders
  - GET /:id/                # Order detail
  - PATCH /:id/status/       # Update order status

/api/deliveries/
  - GET/POST                 # List/create deliveries
  - GET /:id/                # Delivery detail
  - PATCH /:id/status/       # Update delivery status

/api/pricing/
  - GET /trends/             # Price trends
  - GET /insights/           # Market insights
  - GET /analytics/          # Price analytics

/api/notifications/
  - GET                      # User notifications
  - PATCH /:id/read/         # Mark as read
```


## 🚀 Next Steps for Development

### Phase 1: API Implementation (Next)
- [ ] Create serializers for all models
- [ ] Create viewsets for CRUD operations
- [ ] Configure URL routing
- [ ] Add permissions (IsAuthenticated, IsAdmin, IsOwner)
- [ ] Add filtering and search

### Phase 2: Business Logic
- [ ] Basket closing logic (lock prices, create procurement)
- [ ] Dynamic price calculation on basket participation
- [ ] Order total calculation with discounts
- [ ] Notification triggers (signals)
- [ ] Email sending service

### Phase 3: Analytics & Intelligence
- [ ] Price history aggregation (daily job)
- [ ] Trend identification algorithms
- [ ] Market insight generation
- [ ] Dashboard statistics endpoints

### Phase 4: Testing & Documentation
- [ ] Unit tests for models
- [ ] API integration tests
- [ ] API documentation (Swagger/ReDoc)
- [ ] Seed data for development

### Phase 5: Deployment
- [ ] Supabase database setup
- [ ] Environment configuration
- [ ] Static file hosting (Cloudinary/S3)
- [ ] Background task queue (Celery)
- [ ] Production deployment (Railway/Heroku/DigitalOcean)

## 💡 Why This Design?

### Supports Core Value Props
✅ **Group Buying Power**: Basket system with participant tracking  
✅ **Dynamic Pricing**: Three-stage pricing (base → estimated → final)  
✅ **Price Intelligence**: 2-year history + trends + insights  
✅ **Trust & Transparency**: Verification workflows, audit trails  
✅ **Efficiency**: Delivery optimization, multi-address support  

### Enables Future Features
✅ **Procurement Calendar**: Date-based insights already in MarketInsight  
✅ **RFQ/Tender**: Extensible basket/order models  
✅ **Payment Integration**: Order totals and financial tracking ready  
✅ **Mobile App**: REST API supports any client  
✅ **AI Predictions**: Data structures support ML features  

### Built for Scale
✅ **Indexed Queries**: Strategic indexes on hot paths  
✅ **Pre-computed Analytics**: Avoids expensive aggregations  
✅ **Denormalized Snapshots**: Historical accuracy without joins  
✅ **Flexible Schema**: JSON fields for extensibility  
✅ **Clear Partitioning Path**: Time-series data ready to partition  

## 🎓 Learning Resources

- **Django**: https://docs.djangoproject.com/
- **DRF**: https://www.django-rest-framework.org/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Supabase**: https://supabase.com/docs
- **JWT**: https://django-rest-framework-simplejwt.readthedocs.io/

---

**Status**: ✅ Backend structure complete, ready for API implementation
