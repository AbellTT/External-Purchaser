# MBE Procurement Platform

A B2B stationery procurement platform that enables organizations to combine purchasing power for bulk discounts on stationery products.

## Overview

Babi aggregates demand from schools, universities, government offices, NGOs, and private companies into procurement baskets. By pooling orders, organizations unlock progressively better wholesale pricing from suppliers at Merkato (Addis Ababa's main market). The platform dynamically adjusts estimated prices as participation grows.

## Features

- **Basket System** — Weekly, monthly, and 6-month procurement cycles with dynamic discount tiers
- **Direct Purchase** — Immediate ordering at competitive prices for urgent needs
- **Price Intelligence** — 2-year price history, trend analysis, seasonal patterns, and "best time to buy" recommendations
- **Order Management** — Status tracking (pending → accepted → out-for-delivery → delivered), multi-supplier fulfillment
- **Delivery Tracking** — Scheduling with estimated/actual dates and audit trails
- **Notifications** — Real-time in-app alerts for orders, baskets, prices, and deliveries
- **Admin Panel** — Organization verification, supplier management, product catalog, basket/order administration, market data
- **User Dashboard** — Savings overview, active orders, basket participation, discount rates, price alerts
- **Procurement Calendar** — Bi-monthly pricing, seasonal recommendations, Ethiopian calendar support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5, Django REST Framework 3.14, PostgreSQL |
| Frontend | React 19, TypeScript 6, Vite 8 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix Primitives |
| State | Redux Toolkit, Zustand, TanStack React Query |
| Auth | JWT (simplejwt) with HttpOnly refresh cookies |
| Realtime | WebSocket |
| Charts | Recharts |

## Project Structure

```
babi/
├── backend/          # Django REST API server
│   ├── apps/         # Django apps (users, organizations, products, suppliers, baskets, orders, deliveries, pricing, notifications)
│   ├── config/       # Django settings and URL routing
│   └── manage.py     # Django management script
├── frontend/         # React + Vite client
    ├── src/          # Application source (pages, components, store, lib)
    └── index.html    # Entry point
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL

### Backend Setup

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env   # Configure database and secrets
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

### Frontend Setup

```powershell
cd frontend
npm install
copy .env.example .env   # Set VITE_API_BASE_URL
npm run dev
```

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/auth/` | JWT authentication (login, refresh, logout) |
| `/api/users/` | User management and profiles |
| `/api/organizations/` | Organization CRUD and TIN verification |
| `/api/products/` | Product catalog with filtering and pagination |
| `/api/suppliers/` | Supplier management |
| `/api/baskets/` | Procurement basket operations |
| `/api/orders/` | Order management (direct and basket) |
| `/api/deliveries/` | Delivery tracking |
| `/api/pricing/` | Price history and market analytics |
| `/api/notifications/` | In-app notifications |

## License

Proprietary — All rights reserved.
