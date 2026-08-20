# 👤 Module 1.5 — The "Profile Model" Pattern (Option A)

> **Goal**: Extend the User system without breaking the core Django structure.

---

## 🛠️ What is the "Profile" Pattern?

Since you want to keep the flexibility of the default User model while adding your own columns, **Option A** is a perfect choice. This is also called the **User-Profile Dependency** pattern.

### How it works:
We leave the built-in `User` table for authentication (handling usernames and passwords). Then, we create a **link** to a second table called `Profile` where all the "extra" info lives.

---

## 🏗️ The Code (`accounts/models.py`)

Here is how we set it up:

```python
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True)
    developer_level = models.CharField(max_length=50, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
```

### 🔍 Key Concepts:

1.  **`OneToOneField`**: This is like a `ForeignKey`, but stricter. Each User can have **exactly one** profile, and each profile belongs to **exactly one** user.
2.  **`on_delete=models.CASCADE`**: Just like with posts, if the User is deleted, the Profile dies with them.

---

## ⚡ The Magic Part: Django Signals

Normally, if you create a User, you would have to manually create a Profile too. That is annoying and error-prone. 

Django **Signals** are "Event Listeners." We can tell Django: *"Hey, whenever a User is saved to the database, run this function automatically!"*

```python
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
```

**Why this is cool**:
- You create an Admin account? A Profile is created automatically.
- A user signs up on your React frontend? A Profile is created automatically.
- Everything stays in sync without you writing extra code every time!

---

## 🗺️ The High-Level Flow: How it works in a Real App

You asked: *"Do we need to fill the profile? How does it work for project users?"*

Here is the "Big Picture" of a user's journey on DevHub:

### Phase 1: Registration (Creation)
1.  **Action**: A user visits your React site and clicks "Sign Up". They enter a `username` and `password`.
2.  **Backend**: Django creates a new row in the `User` table.
3.  **The Signal**: Instantly, the `post_save` signal catches this event and creates a row in the `Profile` table.
4.  **Result**: The user now has a profile, but it is **empty** (Bio is `null`, Picture is empty). This is fine because we set `blank=True`.

### Phase 2: Onboarding (Updating)
1.  **Action**: The user logs in and goes to "Settings".
2.  **Backend**: We show them a form to fill in their `Location` and `Bio`.
3.  **Result**: We update that **specific** Profile row in the database.

### Summary
-   **Creation** is automatic (handled by the Signal).
-   **Filling out** the info is manual (handled by the User later).
-   **Relationship**: The `OneToOneField` acts like a bridge. If you have a User object, you can always find their profile by doing `user.profile`.

---

## ✅ No Database Reset Required!

Because we are just adding a **new app** and a **new relationship**, we don't have to delete your `devhub_db` or wipe your posts. 

**Next Steps**:
1. Run `python manage.py makemigrations`.
2. Run `python manage.py migrate`.
3. Check the Admin panel—you'll see your `Profile` ready for editing!
