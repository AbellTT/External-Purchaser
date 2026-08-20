# 📙 Module 1 — Django Fundamentals (Part 1: The First Migration)

## ❓ "Where are the models?"

Great question! You're right — we haven't created a single `models.py` file yet. So what is `migrate` actually doing?

### 🧩 Django's Built-in Apps

Django isn't just a skeleton; it comes with several "installed apps" ready to go. Look at your `INSTALLED_APPS` in [devhub_project/settings.py](file:///e:/Documents/desktop/material%20resource/SWE/react%20django/devhub/backend/devhub_project/settings.py):

```python
INSTALLED_APPS = [
    'django.contrib.admin',        # The admin dashboard
    'django.contrib.auth',         # User accounts & permissions
    'django.contrib.contenttypes', # Needed for permissions system
    'django.contrib.sessions',     # Handling logged-in users
    'django.contrib.messages',     # One-time notifications
    'django.contrib.staticfiles',  # CSS/JS file management
    ...
]
```

These apps are part of Django's core. **Each of these apps has its own models and migrations** hidden inside the Django source code. 

When you run `python manage.py migrate`, you are telling Django: 
> "Hey, look at all the apps listed in settings, find their built-in migrations, and create those tables in my PostgreSQL database."

### 🗄️ The Tables You'll See in Postgres

Once the migration finishes, if you open **pgAdmin**, you'll see about 10-15 tables created automatically:

1.  **`auth_user`**: This is the most important one. It stores usernames, passwords, and emails.
2.  **`auth_permission` / `auth_group`**: For the user roles system.
3.  **`django_admin_log`**: Tracks what admins do in the dashboard.
4.  **`django_session`**: Keeps people logged in even if they refresh the page.
5.  **`django_migrations`**: A "history log" that tells Django which migrations have already run.

### 💡 Why do we do this first?
We migrate these **before** writing our own code because our future apps (like `posts`) will often "point" to the `auth_user` table (e.g., "This post was created by *User X*"). The foundations must be built first!

---

## 🚦 Troubleshooting: The "Connection Refused" Error

When I tried to run the migration, I got a **Connection Refused** error. This means Django tried to knock on PostgreSQL's door at port `5432`, but nobody answered.

### 🔍 Let's check 3 things:

1.  **Port Number**: Usually Postgres is on `5432`. However, if you have multiple versions or a specific setup, it might be `5433` or something else.
    - Check your **pgAdmin** connection details (Right-click "Server" → Properties → Connection → Port).
2.  **DB Name**: Ensure the database `devhub_db` exists exactly as spelled (case-sensitive in some tools).
3.  **Password**: Ensure the password in [.env](file:///e:/Documents/desktop/material%20resource/SWE/react%20django/devhub/backend/.env) has no quotes around it, like `DB_PASSWORD=mypassword123`.

Once we fix the connection, we'll run the migrate command again!
