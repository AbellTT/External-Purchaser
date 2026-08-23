# 🗄️ Module 1 — Part 3: Models and the Database

> **Goal**: Define what a "Post" looks like and how Django saves it to PostgreSQL.

---

## 🧠 What is a "Model"?

In Django, a **Model** is a Python class that describes the structure of your data. 

Think of a Model as a **Blueprint** for a table in your database.
- The **Class Name** (`Post`) is the table name.
- The **Attributes** (`title`, `content`) are the columns.

### ❓ Why Python instead of SQL? (The ORM)
Normally, to talk to a database, you need to write SQL (e.g., `CREATE TABLE posts...`). 
Django uses an **ORM (Object-Relational Mapper)**. It lets you write **Python code**, and it automatically translates that Python into **SQL** for you. 

This means you can change databases (from SQLite to PostgreSQL) without changing a single line of your logic!

---

## 🏗️ Building the `Post` Model

Open `posts/models.py`. It currently looks like this:
```python
from django.db import models

# Create your models here.
```

We are going to define a `Post` that has an author, a title, content, and a timestamp.

### The Code:
```python
1: from django.db import models
2: from django.contrib.auth.models import User
3: 
4: class Post(models.Model):
5:     author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
6:     title = models.CharField(max_length=200)
7:     content = models.TextField()
8:     created_at = models.DateTimeField(auto_now_add=True)
9:     updated_at = models.DateTimeField(auto_now=True)
10:
11:    def __str__(self):
12:        return self.title
```

---

## 🧐 Line-by-Line Explanation

Let's look at every single line and understand **exactly** why it's there.

### 1. The Imports
- **Line 1 (`from django.db import models`)**: This is the most basic import in Django. It gives us all the tools to build database tables (like `CharField`, `TextField`, etc.).
- **Line 2 (`from django.contrib.auth.models import User`)**: 

---

#### 👤 DEEP DIVE: The "User" Model — Is it just for Admin?

This is a great point of confusion! You asked: *"Isn't the User table just for Admin access, not for project users?"*

**The Answer is: In Django, they are the SAME thing.**

In many other frameworks, you have to build your own "Member" or "Client" table. But Django is "Batteries Included." It gives you a highly secure, professional `User` model right out of the box.

1.  **One Table for Everyone**: Whether it is an **Admin** (who can see the dashboard) or a **Regular User** (who can only see the React frontend), they both live in the same `auth_user` table. 
2.  **The Difference is "Flags"**: 
    - A User has a checkbox called `is_staff`. If it's checked, they can log into the `/admin/`.
    - A User has a checkbox called `is_superuser`. If it's checked, they have "God Mode" (they can do anything).
    - A "Regular User" (the developers on your DevHub site) will just have both of those boxes **unchecked**. 
3.  **Why relate `Post` to it?**: By relating our `Post` to this built-in `User`, we get all of Django's security for free. We don't have to build a login system from scratch because Django's `User` model already handles passwords, hashing, and "Forgot Password" logic out of the box.

**Summary**: Your Admin account is just a `User` with special permissions. Later, when we build a "Sign Up" page on the React frontend, we will be creating new entries in this **exact same table**.

---

#### 🚀 What if I need more columns? (e.g., Bio, Phone Number, Profile Picture)

You asked: *"What if the project user needs more columns... or there are different types of users?"*

This is the next level of Django! Since the built-in `User` table is locked (it only has Username, Email, Password, etc.), we have two standard ways to add more info:

**Option A: The "Profile" Model (The easiest way)**
We create a second model called `Profile` and link it to the `User` with a **One-to-One** relationship.
- `User` table: Handles login (Username, Password).
- `Profile` table: Handles the "Extra" stuff (Bio, Avatar, Location).
- *Analogy*: The `User` is the ID card, and the `Profile` is the detailed resume.

**Option B: The "Custom User" Model (The professional way)**
We tell Django: "Forget your built-in User, I'm going to write my own User class!" 
- We inherit from `AbstractUser`.
- We can add any columns we want (`github_url`, `developer_level`, etc.) directly into the user table.
- **Note**: For our project, we will likely use **Option B** because it's the modern standard for professional apps.

---

### 2. The Class Definition
- **Line 4 (`class Post(models.Model):`)**:
  - We are creating a new class named `Post`.
  - The `(models.Model)` part is called **Inheritance**. It tells Python that our `Post` is a "Special Django Model". This gives our class magical powers like the ability to save itself to the database (`post.save()`) and delete itself (`post.delete()`).

### 3. The Fields (Your Columns)
- **Line 5 (`author = models.ForeignKey(...)`)**:
  - **`ForeignKey`**: This says "Many posts can belong to ONE User." (A One-to-Many relationship).
  - **`on_delete=models.CASCADE`**: This is a safety rule. If you delete a User, Django will automatically delete all their posts so you don't have "orphan" data.
  - **`related_name='posts'`**: This is a shortcut. It lets you say `user.posts.all()` to get every post that belongs to that specific user.
- **Line 6 (`title = models.CharField(...)`)**:
  - `CharField` is for short text (like a headline). 
  - `max_length=200` is **required** for CharField. It tells the database to set aside exactly enough room for 200 characters.
- **Line 7 (`content = models.TextField()`)**:
  - `TextField` is for long-form content (like the body of a blog post). It has no character limit.
- **Line 8 & 9 (`created_at` / `updated_at`)**:
  - **`auto_now_add=True`**: Automatically sets the current time only when the post is **first created**.
  - **`auto_now=True`**: Automatically updates the time **every single time** you save the post. This is how you track "Last Modified".

### 4. The Human-Readable Label
- **Line 11 & 12 (`def __str__(self):`)**:
  - By default, Django Admin would show your posts as boring items like `Post object (1)`.
  - This method tells Django: "When you want to show this post in a list, just use its **title**." 
  - Now, your admin dashboard will look like a real list of posts!

---

## 🛠️ Key Concept: `on_delete=models.CASCADE`
This is very important for database integrity. 
- If a User is deleted, what happens to their posts?
- `CASCADE` means "If the user is deleted, delete all their posts too." (Don't leave "ghost" posts with no author).

---

## 🔄 The 2-Step Migration Process

Once you save `models.py`, Django doesn't update the database immediately. You have to follow a strictly enforced 2-step process:

### 1. `makemigrations` (Taking a Photo)
Run: `python manage.py makemigrations`
- Django looks at your `models.py` and compares it to the previous version.
- It creates a "migration file" (basically a set of instructions like: "Step 1: Create table Post").
- **Think of this as taking a photo of your changes.**

### 2. `migrate` (Making the Change)
Run: `python manage.py migrate`
- Django reads those instruction files and actually runs the SQL commands on your PostgreSQL database.
- **Think of this as printing the photo and hanging it on the wall.**

### 🏷️ Why is my table named `posts_post`?
You might notice in pgAdmin that your table is named `posts_post` instead of just `Post`. 
- Django follows a **`appname_modelname`** naming convention.
- Since our app is called `posts` and our model is called `Post`, it combines them.
- **Why?** Imagine you have a `users` app with a `Profile` model, and an `instagram` app with a `Profile` model. If they were both named just `Profile`, the database would crash! 
- The `appname_` prefix keeps everything safe and organized.

---

## 🛡️ Step 3: The Admin Register

By default, even if you create a model, it won't show up in the Admin dashboard. You have to "register" it.

Open `posts/admin.py` and add:
```python
from django.contrib import admin
from .models import Post

admin.site.register(Post)
```

Now, when you log into `http://localhost:8001/admin/`, you will see a new section for **Posts** where you can create, edit, and delete them visually!
