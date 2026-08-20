# 👤 Module 1.5 — The "Custom User" Model

> **Goal**: Create our own User table that keeps all of Django's built-in security features but allows us to add custom columns.

---

## 🛠️ The "AbstractUser" Magic

You want to build your own User table but you *don't* want to spend weeks writing your own password hashing, login logic, and permission systems.

Django has a solution: **`AbstractUser`**.

When we inherit from `AbstractUser`, we are saying:
> "Django, give me 100% of your default User features (username, email, password, etc.), but let me add 2 or 3 extra columns of my own."

### The Code (`accounts/models.py`):
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    developer_level = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return self.username
```

---

## ⚠️ The "Breaking Change" Warning (The Migration Reset)

This is the most important lesson in Django architecture: 
**You should always set up a Custom User model at the very start of a project.**

### Why?
Because almost every other app (including Django's internal system) points to the "User". 

1.  **Table Replacement**: When we use `AbstractUser`, we aren't just adding a new app. We are telling Django to **completely delete** the old `auth_user` table and use `accounts_customuser` for every login, every post, and every admin action.
2.  **Dependency Conflict**: Right now, our `posts` migration and the `admin` app migrations are already "wired" to the old `auth_user` table. If we just run a new migration, the database will scream: *"Wait! You told me Posts belong to 'auth_user', but now you're saying users live in 'accounts_customuser'. I'm confused!"*
3.  **The "Clean" Way**: While it is possible to "patch" this without a reset, it is extremely messy and requires manual SQL. In a new project, it is **100% better** to just wipe the slate clean and start with the custom model as the foundation.

### 🛑 Why not just create a second table and leave the Admin one alone?

This is a great architectural question! You asked: *"Can we just create another accounts table and leave the user table for the admin access only?"*

Technically, **yes**, you *could* do that. But in the Django world, that is considered a **major mistake**, and here is why:

1.  **The "Two-Key" Problem**: Imagine your house has two front doors. One door only accepts "Blue Keys" (Admins) and the other only accepts "Red Keys" (Regular Users).
    - You now have to build **two separate lock systems**. 
    - You have to write **two login pages**. 
    - You have to write **two password-reset systems**.
    - Django already gives you one perfect "Lock System" for free. Why build a second one from scratch?
2.  **Broken Features**: Most Django features (like `@login_required` or "Who wrote this post?") are hard-coded to look at the **One True User Model** defined in your settings. If you use a separate table, none of Django's built-in security decorators will work for your regular users.
3.  **The "Promotion" Nightmare**: What if a regular user becomes a moderator or an admin later? 
    - In the **Custom User** way: You just check a box (`is_staff = True`).
    - In the **Two Table** way: You have to delete their account from the User table and recreate it in the Admin table. It’s a mess!

**Summary**: In Django, we want a **Single Source of Truth**. Every human being who uses your site—from the CEO to a random visitor—lives in the same table, just with different "Permission Flags."

---

This seems like a lot of work, but it is a **vital skill** for any Django developer to understand how the migrations and the User model interact.

---

## 🏗️ Step 1: Create the "accounts" App

Conventionally, we keep user logic in an app called `accounts` or `users`.

Run:
```powershell
.\venv\Scripts\python manage.py startapp accounts
```

---

## 🔗 Step 2: Register it in Settings

Open `settings.py` and add two things:
1.  Add `'accounts'` to `INSTALLED_APPS`.
2.  Add this line at the very bottom:
    ```python
    AUTH_USER_MODEL = 'accounts.CustomUser'
    ```

This second line is the "Master Switch." It tells Django which table to use for every login, every admin access, and every relationship in the project.

---

## 🏁 The Workflow

1.  We define `CustomUser`.
2.  We clean the old database.
3.  We start fresh with our professional, custom setup!
