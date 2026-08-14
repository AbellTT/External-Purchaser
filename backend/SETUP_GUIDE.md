# Quick Setup Guide

## Prerequisites
- Python 3.12+ installed
- PostgreSQL installed (for local development)

## Step-by-Step Setup

### 1. Activate Virtual Environment
```powershell
cd c:\Users\AT85\Documents\babi\backend
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure Environment
```powershell
# Copy example env file
Copy-Item .env.example .env

# Edit .env with your settings (use notepad or any editor)
notepad .env
```

**Required Configuration**:
- `DB_NAME`: Your PostgreSQL database name (e.g., `babi_procurement`)
- `DB_USER`: Your PostgreSQL username
- `DB_PASSWORD`: Your PostgreSQL password
- `DB_HOST`: Usually `localhost`
- `DB_PORT`: Usually `5432`
- `SECRET_KEY`: Generate a secure key (change from default!)

### 4. Create PostgreSQL Database
```powershell
# Open PostgreSQL command line (psql) and run:
```
```sql
CREATE DATABASE babi_procurement;
```

### 5. Run Migrations
```powershell
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Admin User
```powershell
python manage.py createsuperuser
```
Follow the prompts to create your admin account.

### 7. Run Development Server
```powershell
python manage.py runserver
```

### 8. Access the API
- API Root: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

## Next Steps
1. Test authentication endpoints
2. Create initial data (categories, products, suppliers)
3. Test basket creation workflow
4. Connect frontend to backend

## Troubleshooting

### "django-admin not recognized"
The virtual environment needs to be activated first.

### Database Connection Error
Check your .env file has correct database credentials.

### Import Errors
Run `pip install -r requirements.txt` again to ensure all dependencies are installed.
