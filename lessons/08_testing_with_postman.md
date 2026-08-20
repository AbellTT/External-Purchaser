# 🧪 Lesson 08 — Testing Your API with Postman

> **Goal**: Learn how to use Postman to test your API like a professional developer.

---

## 🛠️ Why Postman?

While the **DRF Browsable API** (the blue web interface) is great, **Postman** is the industry standard. It allows you to:
1.  Save your requests (Collections).
2.  Test different HTTP methods easily (GET, POST, PUT, DELETE).
3.  Simulate how a React frontend will actually talk to your backend.

---

## 🚀 Setting Up Your First Request

### 1. GET all Posts
1.  Open Postman and click the **+ (New Tab)** button.
2.  Set the method to **GET**.
3.  Enter the URL: `http://127.0.0.1:8001/api/v1/posts/`
4.  Click **Send**.
5.  **Look at the bottom**: You should see a JSON list of all the posts you created earlier!

### 2. GET a Single Post
1.  Change the URL to: `http://127.0.0.1:8001/api/v1/posts/1/` (or use any valid ID).
2.  Click **Send**.
3.  You should see only **one** object.

---

## 🔐 The Challenge: The POST Request (Creating)

If you try to **POST** a new post without being logged in, Django might block you because of our security settings in `settings.py`.

### How to POST in Postman:
1.  Change the method to **POST**.
2.  Enter the URL: `http://127.0.0.1:8001/api/v1/posts/`
3.  Go to the **Body** tab.
4.  Select **raw** and change the format to **JSON**.
5.  Enter a new post data:
    ```json
    {
        "title": "Postman Test",
        "content": "I am sending this from Postman!",
        "author": 1
    }
    ```
6.  Click **Send**.

## ⚠️ The "401 Unauthorized" Wall

If you tried to **POST** a new post and saw `{ "detail": "Authentication credentials were not provided." }`, don't worry! This is a **Security Feature** working correctly.

### Which setting is doing this?
In your `devhub_project/settings.py` (around line 125), we set this:
```python
'DEFAULT_PERMISSION_CLASSES': (
    'rest_framework.permissions.IsAuthenticatedOrReadOnly',
),
```

### What does `IsAuthenticatedOrReadOnly` mean?
- **ReadOnly**: Anyone (even a stranger) can **GET** the list of posts. 
- **IsAuthenticated**: Only a logged-in user can **POST**, **PUT**, or **DELETE**.

Since you are using Postman without logging in, the backend "Guard" is stopping you from writing new data.

---

## 🛠️ How to bypass this for Testing (2 Options)

### Option A: The "Wild West" (Temporary)
If you want to test your POST request *right now* without logging in, change that setting in `settings.py` to:
```python
'rest_framework.permissions.AllowAny', # DANGEROUS for production!
```
**Don't forget to change it back later!**

### Option B: The "Pro" Way (Wait for Module 5)
In Module 5, we will learn how to get a **JWT Token** (a digital key). Once we have that key, we can put it in the **Authorization** tab of Postman, and the Guard will let us through.

---
