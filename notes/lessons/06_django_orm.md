# 🐍 Module 2 — PostgreSQL + Django ORM

> **Goal**: Learn how to talk to your database using Python code instead of SQL queries.

---

## 🛠️ What is an ORM?

**ORM** stands for **Object-Relational Mapper**. 

-   **Object**: Your Python classes (`Post`, `Profile`).
-   **Relational**: Your PostgreSQL tables.
-   **Mapper**: The bridge that translates Python into SQL.

Instead of writing `SELECT * FROM posts_post;`, we write `Post.objects.all()`. Django handles the translation for you!

---

## 🐚 The Django Shell

To practice with the ORM, we use an interactive "Playground" called the Django Shell. This is just like the normal Python terminal, but it "knows" about your Django project and models.

**Run this in your terminal**:
```powershell
.\venv\Scripts\python manage.py shell
```

---

## 📝 CRUD: Create, Read, Update, Delete

Once inside the shell, you need to import your models first.

### 1. Create (Adding Data)
```python
from django.contrib.auth.models import User
from posts.models import Post

# Get the existing user
me = User.objects.get(username='admin') # Use your superuser name

# Create a post
post = Post.objects.create(
    author=me, 
    title="My first ORM post", 
    content="This was created in the shell!"
)
```

### 2. Read (Querying Data)
```python
# Get all posts
all_posts = Post.objects.all()

# Filter by title
specific_posts = Post.objects.filter(title__icontains="first")

# Get a single item (errors if not found)
one_post = Post.objects.get(id=1)
```

### 3. Update (Modifying Data)
```python
post = Post.objects.get(id=1)
post.title = "Updated Title"
post.save() # Don't forget to save!
```

### 4. Delete (Removing Data)
```python
post = Post.objects.get(id=1)
post.delete()
```

---

## ⚠️ Common Gotcha: QuerySet vs. Single Object

You just hit a very important error! You tried to do this:
```python
specific_posts = Post.objects.filter(title__icontains="abebe")
print(specific_posts.content) # ERROR!
```

### Why did it fail?
- **`.filter()`** always returns a **QuerySet**. Think of a QuerySet as a **List** or a **Box of items**. 
- Even if only *one* post matches your filter, Django still gives you a "Box" containing that one post.
- A "Box" doesn't have a `.content` column. Only the **Post item** inside the box has content.

### How to fix it:
You have three options:

**Option 1: Get the first item from the "Box"**
```python
post = Post.objects.filter(title__icontains="abebe").first()
if post:
    print(post.content) # Works!
```

**Option 2: Loop through the "Box"**
```python
posts = Post.objects.filter(title__icontains="abebe")
for p in posts:
    print(p.content) # Works for every item in the list!
```

**Option 3: Use `.get()` if you are 100% sure there is only one**
```python
post = Post.objects.get(id=1) # Returns the single item directly, NOT a box.
print(post.content) # Works!
```

---

## 🎯 Practice Challenge

1. Open the shell.
2. Create a new User via the shell (Look up `User.objects.create_user`).
3. Check if their **Profile** was automatically created (Remember our Signals?).
4. Create a Post for that new user.

**Tell me when you are inside the shell and ready to try it out!**
