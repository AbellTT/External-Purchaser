# ⚙️ Lesson 13: Setting up SimpleJWT

Now that we understand *what* a JWT is, let's wire it up in Django!

We are going to use the officially recommended package for Django REST Framework called **`djangorestframework-simplejwt`**.

## 🤔 Simple Terms: Access Tokens vs. Refresh Tokens

Before we configure them, let's clear up exactly what these two tokens do:

- **The Access Token (The "VIP Pass"):** 
  This is the token you send with *every single request* to the backend (like asking for a user's profile or submitting a new post). Think of it as a VIP pass at a concert. You show it to the bouncer (Django), and if it's valid, you get in. For security reasons, this token expires quickly (usually in 5 to 60 minutes). If a hacker steals it, they can only use it for a very short time.

- **The Refresh Token (The "Pass Generator"):**
  Because the Access Token expires quickly, we don't want the user to have to type in their password every 5 minutes! That's what the Refresh Token is for. You keep this token hidden away securely. When your Access Token expires, React sends the Refresh Token to a special URL in Django and says, *"Hey, my VIP pass expired, but here is my secret Refresh Token. Give me a new VIP pass!"* Django then gives you a brand new Access Token. Refresh tokens usually last much longer (days or weeks).

---

## Step 1: Installation
*(Note: You already have `djangorestframework-simplejwt` installed in your environment, so we can skip the `pip install` command!)*

## Step 2: Configuration (`settings.py`)
Next, we need to tell Django REST Framework to use JWT authentication by default. We do this by updating the `REST_FRAMEWORK` dictionary in `devhub_project/settings.py`:

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```

This tells DRF: *"Whenever an API request comes in, check the HTTP headers for a JWT. If it's valid, authenticate the user!"*

## Step 3: Token Behavior (Lifespans)
We can configure SimpleJWT's behavior by adding a `SIMPLE_JWT` dictionary to `settings.py`. During local development, having tokens expire every 5 minutes can be very annoying to test. 

We will set our access tokens to last for 30 days while we build the app, so we don't have to keep logging in!

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=30),  # Our VIP pass lasts 30 days for now!
    'REFRESH_TOKEN_LIFETIME': timedelta(days=60), # The pass generator lasts 60 days!
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY, # Uses Django's secret key!
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

Notice the `'AUTH_HEADER_TYPES': ('Bearer',)` line? This dictates that when our React app makes a request, it needs to send a header that looks like this:
`Authorization: Bearer <your_jwt_token>`

### 🤓 What does each setting do?
- **`ACCESS_TOKEN_LIFETIME`**: How long your main "VIP Pass" stays valid. We set ours to 30 days for easier development (normally this is ~5 minutes).
- **`REFRESH_TOKEN_LIFETIME`**: How long your "Pass Generator" stays valid. Once this expires, the user *must* log in again with their password.
- **`ROTATE_REFRESH_TOKENS`**: If `True`, using a refresh token gives you a *new* access token AND a *new* refresh token. We'll leave it `False` for simplicity.
- **`BLACKLIST_AFTER_ROTATION`**: Used with rotation. If true, old refresh tokens are permanently blocked so they can't be reused.
- **`UPDATE_LAST_LOGIN`**: If `True`, updates the user's `last_login` timestamp in the database every time they get a token. We keep it `False` to avoid unnecessary database writes checking state.
- **`ALGORITHM`**: The mathematical cryptography algorithm (`HS256`) used to securely sign the token.
- **`SIGNING_KEY`**: The "secret password" used by the algorithm. We use Django's underlying `SECRET_KEY`. If someone steals this key, they can forge their own tokens!
- **`AUTH_HEADER_TYPES`**: The word that must come *before* the token in API requests. Setting it to `Bearer` means React will send `Authorization: Bearer <token>`.
- **`AUTH_HEADER_NAME`**: The specific HTTP header where Django should check for the token.
- **`USER_ID_FIELD` & `USER_ID_CLAIM`**: These tell SimpleJWT to extract the `id` column on our Django User model, and save it safely inside the JWT payload under the property name `user_id`.

## What's Next?
Next, we need to apply these configurations to the backend `settings.py` file.
