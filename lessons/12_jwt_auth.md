# 🔐 Lesson 12: JWT Authentication

Welcome to Module 5! We have a beautiful frontend ready to welcome our developers, but right now, anyone can type anything into those login fields and nothing will happen. We need a way to let our users securely log in, and equally importantly, a way for our frontend to *remember* who they are.

In modern web development, particularly when connecting a **React frontend** to a **Django backend**, the industry standard way to handle this is using **JSON Web Tokens (JWT)**.

---

## 🎟️ What is a JWT?

Think of a JWT like a VIP wristband at a concert. 

1. **Getting the Wristband (Authentication - Login):** You walk up to the security guard (Django), show your ID and ticket (Username and Password). The guard verifies you are who you say you are and hands you a wristband (the JWT).
2. **Using the Wristband (Authorization - API Requests):** Now, every time you want to get a drink at the bar or go to the VIP lounge (make an API request to fetch protected data), you don't need to show your ID and ticket again. You just hold up your wristband. The staff looks at the wristband, sees it's valid, and lets you in.

### The Problem with Traditional "Sessions"
Historically, Django would look at your login credentials, create a "session ID," save it in the database, and hand you a cookie. Every time you made a request, Django would check its database: *"Is this session ID valid?"*

This is **stateful**. The server has to *remember* you by constantly checking the database.

### The Power of JWTs
A JWT is **stateless**. The token itself contains all the information needed to verify who you are, wrapped up with a cryptographic signature. 

When React sends the JWT to Django in an API request, Django just looks at the signature on the token. If the signature matches Django's secret key, Django knows the token is valid, instantly, without ever having to query the database to look up a session ID!

---

## 🔑 The Two Types of Tokens

A standard JWT authentication system actually gives you *two* tokens when you log in:

1. **The Access Token**: This is your main wristband. You include this in every API request. However, for security reasons, it expires very quickly (e.g., in 5 minutes). If a hacker steals it, they can only do damage for 5 minutes.
2. **The Refresh Token**: This token is kept highly secure. Its *only* job is to go back to the bouncer and say, "Hey, my access token expired, but here is my valid refresh token. Please give me a new access token." This usually lasts much longer (e.g., 24 hours).

---

## 🛠️ Our Implementation Plan

Django REST Framework doesn't support JWTs out of the box, but there is an officially recommended package that does it perfectly: **`djangorestframework-simplejwt`**.

Here is what we are going to build in this module:

1. **Installation**: We will install the SimpleJWT package into our Django environment.
2. **Configuration**: We will tell Django REST Framework to use JWTs as the default way to authenticate users.
3. **Login Endpoints**: We will wire up SimpleJWT's built-in views (`TokenObtainPairView` and `TokenRefreshView`) to generate our tokens when a user logs in.
4. **Registration**: SimpleJWT handles *logging in*, but it doesn't handle *signing up*. We will write a custom Django API View to register a new user in the database.
5. **Testing in Postman**: We will use Postman to simulate a React frontend—sending our username/password, getting the tokens back, and using those tokens to access our API!

Let's dive in!
