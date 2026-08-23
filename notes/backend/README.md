# Babi Procurement Platform - Backend

Django REST Framework backend for the stationery procurement platform.

## Setup Instructions

### 1. Virtual Environment

```powershell
# The venv is already created at backend/venv
# Activate it:
cd backend
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and configure your settings:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your database credentials and other settings.

### 4. Database Setup

#### Local PostgreSQL

1. Install PostgreSQL if not already installed
2. Create a database:

```sql
CREATE DATABASE babi_procurement;
CREATE USER your_user WITH PASSWORD 'your_password';
ALTER ROLE your_user SET client_encoding TO 'utf8';
ALTER ROLE your_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE your_user SET timezone TO 'Africa/Addis_Ababa';
GRANT ALL PRIVILEGES ON DATABASE babi_procurement TO your_user;
```

3. Update `.env` with your local database credentials

#### Supabase (Production)

1. Create a Supabase project at https://supabase.com
2. Get your connection details from Supabase dashboard
3. Update `.env` with Supabase credentials:
   - SUPABASE_DB_HOST
   - SUPABASE_DB_NAME
   - SUPABASE_DB_USER
   - SUPABASE_DB_PASSWORD

### 5. Run Migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```powershell
python manage.py createsuperuser
```

### 7. Run Development Server

```powershell
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## Project Structure

```
backend/
├── config/                 # Django configuration
│   ├── settings.py        # Main settings
│   ├── urls.py            # Root URL configuration
│   ├── wsgi.py            # WSGI configuration
│   └── asgi.py            # ASGI configuration
├── apps/                   # Django applications
│   ├── users/             # User authentication and management
│   ├── organizations/     # Organizations and delivery addresses
│   ├── products/          # Product catalog and categories
│   ├── suppliers/         # Supplier management
│   ├── baskets/           # Basket system (core feature)
│   ├── orders/            # Order management
│   ├── deliveries/        # Delivery tracking
│   ├── pricing/           # Price history and analytics
│   └── notifications/     # Notifications and announcements
├── media/                  # Uploaded files
├── staticfiles/           # Collected static files
├── venv/                  # Virtual environment
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Apps
- `/api/users/` - User management
- `/api/organizations/` - Organization management
- `/api/products/` - Product catalog
- `/api/suppliers/` - Supplier management
- `/api/baskets/` - Basket operations
- `/api/orders/` - Order management
- `/api/deliveries/` - Delivery tracking
- `/api/pricing/` - Price history and analytics
- `/api/notifications/` - Notifications

## Key Features

### 1. Basket System
- Weekly, monthly, and six-month procurement baskets
- Dynamic pricing based on participation
- Real-time progress tracking
- Automatic discount tier calculation

### 2. Price Intelligence
- 2-year price history tracking
- Price trend analysis
- Seasonal pattern identification
- Market insights and recommendations

### 3. Organization Management
- Multi-organization support
- Multiple delivery addresses per organization
- Procurement contact management
- Organization verification workflow

### 4. Order Management
- Basket orders and direct purchases
- Order status tracking
- Delivery scheduling
- Order history and analytics

### 5. Notifications
- Real-time notifications for users
- Email notifications
- Platform-wide announcements
- Targeted announcements per organization

## Development

### Running Tests
```powershell
python manage.py test
```

### Creating Migrations
```powershell
python manage.py makemigrations
```

### Applying Migrations
```powershell
python manage.py migrate
```

### Collect Static Files
```powershell
python manage.py collectstatic
```

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/`

Use the superuser credentials you created during setup.

## Next Steps

1. ✅ Backend structure created
2. ✅ Models defined
3. ⏳ Create serializers for each app
4. ⏳ Create viewsets for each app
5. ⏳ Create URL routing for each app
6. ⏳ Write API tests
7. ⏳ Connect frontend to backend
8. ⏳ Deploy to production

## Technology Stack

- **Framework**: Django 5.0.1
- **API**: Django REST Framework 3.14.0
- **Database**: PostgreSQL (local) / Supabase (production)
- **Authentication**: JWT (Simple JWT)
- **Image Processing**: Pillow
- **Environment Management**: python-decouple
- **CORS**: django-cors-headers
