# Lesson 17: Connecting Frontend and Backend (CORS & Axios)

Welcome to Module 7! This is where we bridge the gap between our Django REST API and our React frontend.

Currently, we have two separate servers running:
1.  **Django Backend:** `http://127.0.0.1:8000` (or `8001`)
2.  **React Frontend:** `http://localhost:5173` (Vite's default)

By default, web browsers have a strict security policy called the **Same-Origin Policy**. This policy prevents a website on one domain (like our React app on port 5173) from making requests to a different domain (like our Django app on port 8000).

To make them talk to each other safely, we need to bypass this policy using **CORS (Cross-Origin Resource Sharing)**.

## Understanding CORS

CORS is a mechanism that uses additional HTTP headers to tell browsers to give a web application running at one origin, access to selected resources from a different origin.

In our case, we need to configure our Django backend to explicitly say: *"Hey browser, it's okay for the React app running on `http://localhost:5173` to request data from me!"*

## Frontend API Service (Axios)

On the React side, while we could use the built-in `fetch` API, it's very common and often much easier to use a library called **Axios**.

Axios makes HTTP requests much simpler to write and handle, especially when dealing with things like JSON data, error handling, and eventually, attaching our JWT tokens to every request.

Instead of writing the full API URL (`http://127.0.0.1:8000/api/v1/posts/`) in every single React component, we'll create a dedicated "API Service" file. This file will be responsible for creating an Axios instance with our base URL already configured, making our code clean and reusable.

## State Management with Redux Toolkit

### 🤔 What is Redux?

Redux is a **global state manager** for JavaScript apps. 

Think of it like this: React's normal `useState` is like a **notepad on your desk** — only *you* (that one component) can read from it and write to it. Redux is like a **whiteboard in the middle of the office** — *any* component in your entire app can read from it or update it.

Without Redux, if your `LoginPage` grabs a JWT token, that token only lives inside `LoginPage`. The moment the user navigates to the `Feed` page, it's gone — the `Feed` page doesn't know the user is logged in. Redux solves this by keeping data **outside** of any single component, in a central store.

---

### 🧩 Core Concepts

#### 1. Store
The **store** is the single whiteboard — the one place that holds all your global state. Your entire app has only **one store**. You create it once and plug it into React.

```js
// The whole app's global data lives here
store = {
  auth: {
    user: { id: 1, username: 'john' },
    accessToken: 'abc123...',
    isAuthenticated: true
  }
}
```

#### 2. Slice
A **slice** is a section of the store dedicated to one feature. Instead of one giant file, Redux Toolkit lets you split the store into feature slices. We will create an `authSlice` that manages just the auth-related data.

Each slice comes with:
- Its own piece of **state** (initial values)
- Its own **reducers** (functions that update that state)
- Auto-generated **actions** (the events that trigger the reducers)

#### 3. Reducer
A **reducer** is a function that describes *how the state changes* when something happens. It takes the current state and an action, and returns the new state.

```
(currentState, action) → newState
```

Think of it like a cashier at a shop. A customer (action) comes in and says "I want to deposit money". The cashier (reducer) updates the balance (state). The cashier never invents transactions on their own — they only respond to customer requests.

#### 4. Action / Dispatch
An **action** is just a plain object that says *"something happened"*. You **dispatch** an action to tell Redux to run the matching reducer.

```js
// Somewhere in your LoginPage, after a successful login:
dispatch(setCredentials({ user, accessToken, refreshToken }))
```

This is the equivalent of the customer walking up to the cashier's desk. `setCredentials` is the action, `dispatch` is the act of handing the note to the cashier.

#### 5. Selector (useSelector)
A **selector** is how a component *reads* data from the store. In React, you use the `useSelector` hook.

```js
// In your Navbar, to show the logged-in user's name:
const user = useSelector((state) => state.auth.user)
```

---

### 🔄 The Full Flow

```
User clicks "Login"
    → LoginPage calls our Django API
        → Django returns { access, refresh, user }
            → LoginPage dispatches setCredentials(...)
                → Redux updates the store
                    → Every component using useSelector re-renders with new data
```

---

### 📦 Redux Toolkit vs "Old" Redux

You may see old Redux tutorials that are very verbose. **Redux Toolkit (RTK)** is the modern, official way to write Redux — it removes 80% of the boilerplate. We will always use RTK.

---

For the frontend, we will use **Redux Toolkit** to manage global state across pages. This is critical for authentication because:

- The **JWT access token** must be available to any page that makes a protected API call.
- The **user's info** (username, id) must be accessible in the Navbar, Profile page, Feed, etc.
- Without global state, logging in on one page and then navigating to another would "forget" the user.

Our Redux store will hold an `auth` slice with:
- `accessToken` — the JWT token sent with every request
- `refreshToken` — used to get a new access token when it expires
- `user` — the logged-in user's basic info
- `isAuthenticated` — a boolean flag for easy conditional rendering

We'll also configure **Axios Interceptors** to automatically attach the token from Redux to every outgoing request header, so no component ever has to think about it.

## Module 7 Roadmap

| Step | Task |
|------|------|
| 1 | Install and configure `django-cors-headers` on the backend |
| 2 | Install `axios` and create `src/services/api.js` |
| 3 | Install `@reduxjs/toolkit` and `react-redux` |
| 4 | Create the `authSlice` to manage token/user state |
| 5 | Connect Axios interceptors to Redux auth state |
| 6 | Build a Login page that dispatches to Redux on success |
| 7 | Build a protected Post Feed page that uses the token |
