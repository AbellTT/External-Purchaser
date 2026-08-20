# 📟 Module 1 — Part 4: Running the Server & Admin

> **Goal**: Learn how to start the engine and access the command center.

---

## 🚀 Starting the Development Server

A Django project is like a car. You've built the engine (Models) and the dashboard (Admin), but now you need to **start the ignition**.

### The Command:
Since we know that PostgreSQL is using port **8000**, we have to point Django away from it. By default, Django tries to use 8000, so we will tell it to use **8001** instead.

Run this in your terminal (inside the `backend` folder):
```powershell
.\venv\Scripts\python manage.py runserver 8001
```

### 🌍 Accessing the Site:
1. Open your browser.
2. Go to: `http://localhost:8001/`
3. You should see the **"The install worked successfully!"** rocket ship page.

---

## 🛡️ The Django Admin Panel

Django automatically builds a full back-office for you. We registered our `Post` model here specifically so we could edit it visually.

### How to access it:
Go to: `http://localhost:8001/admin/`

### ❓ "Wait, I don't have a login!"
You're right! We need to create a **Superuser** (the ultimate admin account).

**How to create it:**
1. Keep the server running in one terminal, OR open a **second terminal** and activate the venv.
2. Run:
   ```powershell
   .\venv\Scripts\python manage.py createsuperuser
   ```
3. Follow the prompts:
   - **Username**: (pick one, e.g., `admin`)
   - **Email**: (can keep empty or use a fake one)
   - **Password**: (type it carefully — it won't show characters while you type!)

### 🏁 Verify the Model:
1. Log in to the admin panel with your new account.
2. You should see a section called **POSTS**.
3. Click **Add** and try to create your very first post!

---

## 🧩 FAQ: Why `posts_post` and why no `User` column?

### 1. The Table Name (`posts_post`)
When you make migrations, Django says "Create model Post". **Operations** use the class name (`Post`).
But in the **Database**, Django names tables as `appname_modelname`. 
- **App**: `posts`
- **Model**: `post`
- **Result**: `posts_post`
This prevents conflicts if you have another app with a model named "Post".

### 2. The User Relationship
- **Does it create a column in the User table?** **No.**
- Database tables (SQL) can only "point" one way. The `posts_post` table has an `author_id` column that points to the `User`.
- In **Python/Django**, however, it *looks* like the User has a posts attribute. Because of `related_name='posts'`, you can get all posts for a user using `user.posts.all()`. Django does this "magic" for you on the fly!
