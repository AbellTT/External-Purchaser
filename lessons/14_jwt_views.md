# 🌐 Lesson 14: Authentication Endpoints & Registration

Now that Django knows _how_ to use JWTs, we need to build the endpoints for our frontend to use.

We need three distinct API URLs:

1. `POST /api/v1/accounts/login/`: Verifies username/password and returns tokens.
2. `POST /api/v1/accounts/refresh/`: Trades an expired refresh token for a new access token.
3. `POST /api/v1/accounts/register/`: Creates a brand new user.

SimpleJWT gives us the views for `login` and `refresh` automatically. But, it does _not_ do registration. We have to build that ourselves.

---

## 📝 Step 1: The Registration Serializer

Whenever we receive data from the frontend (like a requested username and password), we need a Serializer to validate it and save it to the database.

**Your Task:** Open your existing `accounts/serializers.py` file. **DO NOT delete your `ProfileSerializer`!** Just add the `User` import at the top, and append the new `UserRegistrationSerializer` code to the bottom of the file:

```python
from rest_framework import serializers
from django.contrib.auth.models import User # <-- ADD THIS IMPORT
from .models import Profile

# ... (Keep your existing ProfileSerializer here) ...

# ADD THIS NEW SERIALIZER TO THE BOTTOM:
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
```

### 🧠 Code Breakdown:

- **`write_only=True`**: This is crucial for security! It means a user can _send_ a password to this endpoint to create an account, but DRF will _never_ return the password back in a JSON response.
- **`create()` function**: You noticed this isn't called directly in the View! Here is how DRF works: When the `CreateAPIView` (which we build in Step 2) receives a POST request, it automatically grabs the data and passes it to the Serializer. The Serializer checks if the data is valid. If it is, the View automatically calls `serializer.save()`. Behind the scenes, `serializer.save()` triggers this exact `create()` function!
- **`create_user()`**: Inside our `create()` function, we use Django's built-in `User.objects.create_user()`. If we just saved the password normally, it would save as plain text in the database. `create_user()` takes the `validated_data` (the username, email, and password from the frontend) and automatically hashes (encrypts) the password with strong cryptography before saving it!

---

## 🚦 Step 2: The Registration View

Now we need an API View to catch the HTTP request and pass it to our new serializer.

**Your Task:** Open your existing `accounts/views.py`. **DO NOT delete your `ProfileDetail` view!** Add the new imports to the top, and append the `UserRegistrationView` to the bottom:

```python
from rest_framework import generics
from rest_framework.permissions import AllowAny # <-- ADD THIS IMPORT
from django.contrib.auth.models import User # <-- ADD THIS IMPORT
from .models import Profile
from .serializers import ProfileSerializer, UserRegistrationSerializer # <-- ADD THE NEW SERIALIZER

# ... (Keep your existing ProfileDetail view here) ...

# ADD THIS NEW VIEW TO THE BOTTOM:
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = (AllowAny,)
```

### 🧠 Code Breakdown:

- **`CreateAPIView`**: We use DRF's built-in view explicitly designed for `POST` requests meant to create new objects.
- **`AllowAny`**: Remember how we told DRF earlier to require authentication for everything? Since a user _isn't_ logged in when they are trying to register, we must specifically grant this view `AllowAny` permissions so guests can reach it.
- **Where is the token after registration?**: You asked a brilliant question! _"After the user is registered, how are we giving the token?"_
  - **Answer**: We aren't! Our `UserRegistrationView` _only_ registers the user and returns a `201 Created` status code. It does NOT automatically generate a JWT or log them in.
  - In modern architecture, it is best practice to keep **Registration** and **Login** completely separate. When you wire this up in React, the flow will be:
    1. React `POST`s data to `/register/`.
    2. Django responds with `201 Created`.
    3. React immediately takes that exact same username and password and automatically makes a second `POST` request to `/login/` behind the scenes to fetch the tokens!

---

## 🔌 Step 3: Wiring Up the App URLs

Now we map our custom Registration view, along with SimpleJWTs two built-in views, to endpoints.

**Your Task:** Open your existing `accounts/urls.py` and strictly **append** the three new paths to your existing `urlpatterns` list. Do not delete the `<int:pk>/` profile route!

```python
from django.urls import path
# ADD THESE IMPORTS:
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProfileDetail, UserRegistrationView

urlpatterns = [
    # Keep your existing profile route:
    path('<int:pk>/', ProfileDetail.as_view(), name='profile-detail'),

    # ADD THESE THREE NEW ROUTES:
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', UserRegistrationView.as_view(), name='user_register'),
]
```

### 🧠 Code Breakdown:

- **`TokenObtainPairView` (`/login/`)**:
  - _Where does this come from?_ This is a pre-built View that was installed when we ran `pip install djangorestframework-simplejwt`.
  - _How does it give the token?_ When a user sends a `POST` request to `/login/` with a `username` and `password`, this pre-built view automatically checks the Django database. If the password matches, the view automatically generates the JWT string and returns it directly in the HTTP JSON response! We don't have to code any of that logic ourselves.
  - _How does it know which table to check?_ SimpleJWT is tightly integrated with Django's native authentication system. By default, Django is wired to look for credentials in the built-in `auth_user` database table (which is represented by the exact same `User` model we used in our Registration view!). Because we didn't change Django's default user infrastructure in `settings.py`, SimpleJWT knows exactly where to look without any extra configuration!
- **`TokenRefreshView` (`/refresh/`)**: When the access token expires, the frontend sends the refresh token here, and this pre-built view spits out a fresh access token.
- **`UserRegistrationView` (`/register/`)**: We map this URL to the custom view we just built in Step 2.

---

## 🌍 Step 4: The Main Project Routing

We already have `accounts.urls` wired up to `/api/v1/accounts/` in our main `devhub_project/urls.py`, so there is actually nothing you need to do for Step 4!

Because we appended the login/refresh/register routes to `accounts/urls.py`, they are automatically living at:

- `http://127.0.0.1:8001/api/v1/accounts/login/`
- `http://127.0.0.1:8001/api/v1/accounts/refresh/`
- `http://127.0.0.1:8001/api/v1/accounts/register/`

## 🎉 Ready to Test!

Let me know when you have updated the code in those 3 files. We will then jump over to Postman to verify that the entire authentication flow works!
