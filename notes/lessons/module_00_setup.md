# 📘 Module 0 — Environment Setup (Detailed Lesson)

> **Goal**: Understand every command we ran, every file we created, and why — so you can do this from scratch on your own.

---

## 🧠 Core Concept First: What Are We Building?

We are building a **decoupled full-stack app**. That means:

- **Backend** (Django) → runs on `http://localhost:8000` — it only gives us data as JSON
- **Frontend** (React) → runs on `http://localhost:5173` — it shows the UI and fetches data from Django

They are **two completely separate programs** that talk to each other over HTTP. This is how most modern web apps work (e.g. Twitter's API is separate from the Twitter frontend).

---

## 📁 Step 1 — Creating the Project Folders

### What we ran:
```powershell
mkdir devhub
mkdir devhub\backend
mkdir devhub\frontend
```

### What this does:
- `mkdir devhub` → creates the **root project folder**
- `mkdir devhub\backend` → this is where all Django code lives
- `mkdir devhub\frontend` → this is where all React code lives

### Why this structure?
This is called a **monorepo** — one folder that contains both the frontend and backend. It keeps everything organized in one place while keeping Django and React completely separate from each other.

---

## 🐍 Step 2 — Python Virtual Environment

### What we ran:
```powershell
python -m venv venv
```
(Run inside `devhub\backend\`)

### What this does:
- Creates a **virtual environment** — a completely isolated Python installation just for this project
- It creates a folder called `venv/` which contains its own copy of Python and pip

### 💡 WHY do we need a virtual environment?

Imagine you have two projects:
- Project A needs Django 4.0
- Project B needs Django 5.0

Without a virtual environment, both projects share the **same global Python** — so you can only have one version of Django installed at a time. That's a problem!

A virtual environment gives each project its **own isolated set of packages**. Project A and Project B can have completely different package versions, side by side, no conflict.

**Always create a venv before installing any packages for a Django project.**

### How to activate it (you need to do this every time you open a new terminal):
```powershell
# On Windows:
.\venv\Scripts\activate

# You'll see (venv) appear at the start of your terminal line
(venv) PS E:\...\backend>
```

---

## 📦 Step 3 — Installing Packages

### What we ran:
```powershell
.\venv\Scripts\pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow python-decouple psycopg2-binary
```

### Why `.\venv\Scripts\pip` instead of just `pip`?
Because we want to install packages **into the virtual environment**, not into the system-wide Python. Using `.\venv\Scripts\pip` makes sure we're targeting the right one.

### What each package does:

| Package | What It Does |
|---------|-------------|
| `django` | The main web framework — gives us models, views, URLs, admin, etc. |
| `djangorestframework` | Adds powerful tools to build REST APIs (DRF) |
| `djangorestframework-simplejwt` | JWT authentication — like login tokens that expire |
| `django-cors-headers` | Allows our React app to talk to Django from a different port |
| `Pillow` | Image processing library — needed for profile pictures later |
| `python-decouple` | Reads secret values (passwords, keys) from a `.env` file |
| `psycopg2-binary` | The "driver" — lets Django talk to a PostgreSQL database |

---

## 📋 Step 4 — Saving the Package List

### What we ran:
```powershell
.\venv\Scripts\pip freeze > requirements.txt
```

### What this does:
- `pip freeze` → lists all installed packages with their exact versions
- `> requirements.txt` → writes that list to a file called `requirements.txt`

### Why is requirements.txt important?
When someone else clones your project (or you set it up on a new machine), they can run:
```powershell
pip install -r requirements.txt
```
...and they'll get **exactly the same packages** you have. This guarantees everyone runs the same versions.

---

## 🏗️ Step 5 — Creating the Django Project

### What we ran:
```powershell
.\venv\Scripts\django-admin startproject devhub_project .
```
(Run inside `devhub\backend\`)

### Breaking down the command:
- `.\venv\Scripts\django-admin` → use the `django-admin` tool from our venv
- `startproject` → the command that creates a new Django project
- `devhub_project` → the **name** of our Django project (this becomes a folder name)
- `.` → create it **in the current folder** (the `.` means "here")

> ⚠️ The `.` at the end is important! Without it, Django creates an extra nested folder. With it, `manage.py` sits directly inside `backend/`.

---

## 📂 The Django Project Structure — Explained

After running `startproject`, your `backend/` folder looks like this:

```
backend/
├── venv/                        ← Virtual environment (ignore this)
├── requirements.txt             ← Package list
├── .env                         ← Secret values (passwords, keys)
├── manage.py                    ← 🔑 The Django command-line tool
└── devhub_project/              ← The core "settings" package
    ├── __init__.py              ← Makes this folder a Python package
    ├── settings.py              ← All configuration lives here
    ├── urls.py                  ← The main URL router
    ├── asgi.py                  ← For async server deployment
    └── wsgi.py                  ← For regular server deployment
```

### Let's explain each file in detail:

---

### `manage.py` — The Swiss Army Knife

This is the **most used file** in Django. You will run it constantly.

```powershell
python manage.py runserver        # Start the development server
python manage.py makemigrations   # Detect model changes
python manage.py migrate          # Apply changes to the database
python manage.py createsuperuser  # Create an admin account
python manage.py startapp posts   # Create a new app module
python manage.py shell            # Open an interactive Python shell
```

It's just a Python script — it loads Django's settings and lets you run commands.

---

### `devhub_project/` — The Core Config Package

This folder is a **Python package** (notice the `__init__.py` inside). It holds the "brain" of the project — settings, URL routing, and server config.

#### `settings.py` — Project Configuration

This is where **all global configuration** lives. Think of it as the "master config file". Key sections:

```python
SECRET_KEY      # A long random string Django uses for security (keep it secret!)
DEBUG           # True = show detailed error pages. False in production!
INSTALLED_APPS  # List of features/apps that are active
DATABASES       # Which database to use and how to connect
MIDDLEWARE      # Functions that run on every request/response
STATIC_URL      # URL prefix for CSS, JS, image files
```

#### `urls.py` — The Front Door URL Router

This is the **main URL table** for your whole project. Every URL request goes through here first.

```python
# Example: devhub_project/urls.py
urlpatterns = [
    path('admin/', admin.site.urls),     # /admin/ → Django admin
    path('api/', include('posts.urls')), # /api/... → posts app URLs
]
```

Think of it as a **receptionist** — every incoming request arrives here and gets directed to the right place.

#### `wsgi.py` and `asgi.py`

These are only used when you **deploy to production**. 
- `wsgi.py` → for traditional web servers (Gunicorn)
- `asgi.py` → for async servers (Daphne, Uvicorn)

For learning, you can **ignore these** — `manage.py runserver` handles everything for you.

#### `__init__.py`

An empty file that tells Python "this folder is a package". You'll see this in many Django folders. You almost never edit it.

---

## 🔐 Step 6 — The `.env` File

### What we created:
```
# devhub/backend/.env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=devhub_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

### What is this file?
`.env` stands for **environment variables**. It holds sensitive values that should **never go into your code** — especially secrets like passwords and API keys.

### Why not just put the password directly in `settings.py`?
Because `settings.py` gets pushed to GitHub for everyone to see! Your database password would be public. The `.env` file is listed in `.gitignore`, so it stays only on your machine.

### How does `python-decouple` read it?
In `settings.py`, instead of writing the password directly:
```python
# ❌ Bad - password is in your code
'PASSWORD': 'my_secret_password123',

# ✅ Good - password comes from .env file
'PASSWORD': config('DB_PASSWORD'),
```

`config('DB_PASSWORD')` looks up the value of `DB_PASSWORD` from the `.env` file at runtime. Clean and safe.

---

## ⚙️ Step 7 — Understanding `settings.py` (What We Changed)

We replaced the default `settings.py` with a much more complete version. Let's walk through the important additions:

### Reading from .env:
```python
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=True, cast=bool)
```
`cast=bool` converts the string "True" from the `.env` file into an actual Python `True` boolean.

### Installed Apps we added:
```python
'rest_framework',              # Django REST Framework (DRF)
'rest_framework_simplejwt',    # JWT token auth
'rest_framework_simplejwt.token_blacklist',  # Lets tokens be "logged out"
'corsheaders',                 # Allows React to call our API
```

### CORS Config:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',  # React's dev server
]
```
Without this, when React (on port 5173) tries to call Django (on port 8000), the browser will **block the request** with a CORS error. This setting allows it.

### DRF (Django REST Framework) Config:
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    ...
}
```
This tells DRF: "when someone calls our API, verify their identity using JWT tokens".

### JWT Config:
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # Token expires in 1 hour
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # You can get a new one for 7 days
    'ROTATE_REFRESH_TOKENS': True,                   # New refresh token on each use
    'BLACKLIST_AFTER_ROTATION': True,                # Old token can't be reused
}
```

---

## ⚛️ Step 8 — React + Tailwind Setup

### Scaffolding the React App:
```powershell
npm create vite@latest . -- --template react
```
- `npm create vite@latest` → use Vite's project creator tool
- `.` → create it in the current folder
- `-- --template react` → use the React template (not Vue, Svelte, etc.)

This creates the standard Vite React structure you already know.

### Installing frontend packages:
```powershell
npm install                              # Install default Vite/React packages
npm install -D tailwindcss @tailwindcss/vite   # Tailwind (dev dependency)
npm install react-router-dom axios       # Routing + HTTP client
```

- `-D` flag = **dev dependency** — only needed during development, not in production build
- `react-router-dom` → lets us have multiple pages (`/feed`, `/login`, `/profile`, etc.)
- `axios` → makes HTTP requests to our Django API easier than raw `fetch`

### Wiring up Tailwind in `vite.config.js`:
```js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],  // ← Tailwind as a Vite plugin
})
```

### Injecting Tailwind into your CSS (`src/index.css`):
```css
@import "tailwindcss";
```
This single line gives you access to **all Tailwind utility classes** across your entire app.

---

## 🔴 The VS Code Error — "Could not find import of `decouple`"

### What it says:
```
Could not find import of `decouple`, looked at search roots () and site package path ()
Pyre2(missing-module-attribute)
```

### What's actually happening:
This is **NOT a real Python error**. The code works perfectly fine. It's a VS Code linting tool (Pyre2) complaining because it doesn't know about your virtual environment's packages.

The `decouple` package **is** installed — but inside `venv/`. Pyre2 is looking in the wrong place.

### How to permanently fix it:
1. Press `Ctrl + Shift + P` in VS Code
2. Type **"Python: Select Interpreter"**
3. Click on it
4. Choose the one that says **`.\venv\Scripts\python.exe`** (inside your `backend` folder)

Once you select the venv's Python as your interpreter, VS Code will find all your packages and the errors will disappear.

---

## ✅ Module 0 Checklist

- [x] Understood the decoupled architecture (Django API + React UI)
- [x] Created the project folder structure (`devhub/backend/` + `devhub/frontend/`)
- [x] Created and understood virtual environments
- [x] Installed all Django + DRF packages
- [x] Created `requirements.txt` for reproducibility
- [x] Ran `django-admin startproject` and understood every file it created
- [x] Understood what `manage.py` is and its key commands
- [x] Understood `.env` files and `python-decouple`
- [x] Walked through `settings.py` changes in detail
- [x] Set up Vite + React + Tailwind + React Router + Axios
- [ ] Install PostgreSQL + create `devhub_db` database
- [ ] Run first Django migration

---

---

## 🛠️ Troubleshooting: Persistent Linter Errors ("Ghost" Errors)

If you see errors like `Could not find import of decouple` or `django` even after selecting the interpreter, it’s usually because of how VS Code handles **nested projects**.

### Why it happens:
VS Code is likely looking at your **root folder** (`react django/`) as the project base, but your Python environment is hidden three levels deep in `devhub/backend/venv/`. The linter gets confused about where to look for packages.

### How to fix it (The "Nuke" Method):
1. **Restart Language Server**: Press `Ctrl + Shift + P` → Type **"Python: Restart Language Server"**.
2. **Settings JSON**: Open `.vscode/settings.json` (create it if it doesn't exist) and ensure it has:
   ```json
   {
       "python.defaultInterpreterPath": "devhub/backend/venv/Scripts/python.exe",
       "python.analysis.extraPaths": ["./devhub/backend"]
   }
   ```
3. **The Ultimate Proof**: Open a terminal in the `backend` folder and run:
   ```powershell
   .\venv\Scripts\python manage.py check
   ```
   **If this command says "System check identified no issues", your code is 100% fine.** You can ignore the red lines in the editor — they are just the editor being slow to catch up!

---

## 🏁 Final Step: Connect PostgreSQL

1. Open `devhub/backend/.env`
2. Change `DB_PASSWORD=your_postgres_password` to your **actual** PostgreSQL password.
3. Save the file.
4. Run this in your terminal to create the tables in your database:
   ```powershell
   .\venv\Scripts\python manage.py migrate
   ```
