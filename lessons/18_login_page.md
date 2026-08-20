# Lesson 18: Wiring Up Login with JWT + Redux

---

## What Happens When a User Logs In?

When you submit the login form, here is the exact sequence of events we will build:

```
1. User submits username + password
2. React sends a POST request to:   /api/v1/accounts/login/
3. Django checks credentials and responds with:
   {
     "access":  "eyJhbGciOi...",   ← short-lived JWT access token
     "refresh": "eyJhbGciOi..."    ← long-lived refresh token
   }
4. React receives the tokens
5. React dispatches setCredentials(...) to Redux
6. Redux stores the tokens in the global store
7. React navigates the user to the Feed/Dashboard page
```

---

## Key Hooks You'll Use

### `useDispatch`
This hook gives you access to the Redux `dispatch` function inside a component.
```js
const dispatch = useDispatch()
// Later...
dispatch(setCredentials({ accessToken, refreshToken, user }))
```

### `useNavigate`
This hook from `react-router-dom` lets you programmatically redirect the user to another page.
```js
const navigate = useNavigate()
// Later...
navigate('/feed')  // redirect to feed after login
```

---

## How Axios POST Works

```js
// api.post(url, data) sends a POST request with a JSON body
const response = await api.post('/accounts/login/', {
  username: formData.username,
  password: formData.password,
})
// response.data contains the JSON the Django server returned
const { access, refresh } = response.data
```

> **Note:** Django's `TokenObtainPairView` expects `username` and `password` fields — **not** `email`. Keep this in mind!

---

## Error Handling

Always wrap API calls in `try/catch` so the app doesn't crash on wrong credentials:
```js
try {
  const response = await api.post(...)
  // success path
} catch (error) {
  // error.response.data has Django's error message
  setError('Invalid username or password')
}
```
