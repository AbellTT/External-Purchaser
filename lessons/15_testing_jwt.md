# 🧪 Lesson 15: Testing JWTs in Postman

We have our endpoints built! Now it's time to prove they work by simulating a frontend request using Postman.

Make sure your server is running (I see you are using port `8001`!). Let's test the complete flow: Registration -> Login -> Refresh.

---

## 🙋‍♂️ Step 1: Register a New User

First, we need to send data to our custom `UserRegistrationSerializer`.

1. Open Postman and open a new tab.
2. Change the method from GET to **`POST`**.
3. Enter the URL: `http://127.0.0.1:8001/api/v1/accounts/register/`
4. Go to the **Body** tab underneath the URL.
5. Select **`raw`** and change the format dropdown from `Text` to **`JSON`**.
6. Type exactly this payload into the box (use your own info if you want!):
```json
{
    "username": "testdeveloper",
    "email": "test@devhub.com",
    "password": "SuperSecretPassword123!"
}
```
7. Hit **Send**!

✅ **Success Output:** 
You should see a `201 Created` status code, and the response should echo back the `username` and `email` (but crucially, *not* the password, thanks to our `write_only=True` rule!).

---

## 🎟️ Step 2: Login to get the JWT

Now that the user exists in the database, let's ask Django's `TokenObtainPairView` for our VIP passes.

1. Open a new tab in Postman.
2. Change the method to **`POST`**.
3. Enter the URL: `http://127.0.0.1:8001/api/v1/accounts/login/`
4. Go to the **Body** tab, select **`raw`**, and choose **`JSON`**.
5. Type in the credentials of the user you just created:
```json
{
    "username": "testdeveloper",
    "password": "SuperSecretPassword123!"
}
```
6. Hit **Send**!

✅ **Success Output:**
You should see a `200 OK` status code, and the response will look like this:
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```
**Boom!** You just received your Access Token and your Refresh Token!

---

## 🔄 Step 3: Use the Refresh Token (Optional Test)

If your access token eventually expires, the frontend will send the refresh token to get a new one. Let's see how that looks.

1. Copy the long string of text inside the `"refresh"` quotes from Step 2.
2. Open a new tab in Postman.
3. Change the method to **`POST`**.
4. Enter the URL: `http://127.0.0.1:8001/api/v1/accounts/refresh/`
5. Go to the **Body** tab, select **`raw`**, and choose **`JSON`**.
6. Paste your refresh token into this payload:
```json
{
    "refresh": "PASTE_YOUR_REFRESH_TOKEN_STRING_HERE"
}
```
7. Hit **Send**!

✅ **Success Output:**
You should get a `200 OK` and a brand new `"access"` token in the response! 

## Ready?
Open Postman, run through these three steps, and let me know if you run into any errors or if you successfully get your tokens!
