# API Requirements Corrections - Iteration 1 Complete

**Date:** 2026-08-06  
**Sections Covered:** 1-4 (Landing Page, Register, Login, Refresh Token)

---

## Summary of Changes

### ✅ Section 1: Landing Page
**Status:** No changes required  
- Contact form API is correct as-is
- Endpoint: `POST /api/contact/submit`

---

### ✅ Section 2: Register New User

#### Major Changes:
1. **Complete Request Body Restructured** based on actual frontend registration flow
   - Added all 3 steps from the registration wizard
   - Step 1: Organization Details (name, type, phone, TIN)
   - Step 2: Address Information (with autocomplete vs manual distinction)
   - Step 3: Account Credentials (email, password)

2. **Address Type Tracking**
   - Added `addressType: "autocomplete" | "manual"` field
   - Different required fields based on address type
   - Backend must store which method was used

3. **Complete Address Structure**
   ```typescript
   address: {
     addressType: "autocomplete" | "manual"
     addressFormatted: string | null    // For autocomplete
     street: string | null              // For manual
     subCity: string | null             // Sub-city (Kifle Ketema)
     area: string | null                // Area / Sefer
     city: string                       // Always "Addis Ababa"
     region: string                     // Always "Addis Ababa City Administration"
   }
   ```

4. **Registration → Dashboard Flow (NOT Login Page)**
   - Response now includes `accessToken` and `refreshToken`
   - User is immediately authenticated after registration
   - Frontend redirects to `/dashboard`, not `/login`
   - Matches login response structure for consistency

5. **Validation Rules Documented**
   - phoneNumber: exactly 10 digits
   - tinNumber: exactly 10 digits
   - email: valid email format
   - password: minimum 8 characters
   - Conditional validation based on addressType

---

### ✅ Section 3: Login

#### Major Changes:
1. **Removed `role` field** from response
   - System treats logged-in user as the organization itself
   - No role-based access for normal users (only org-level access)

2. **Added Complete Organization Profile**
   ```typescript
   user: {
     id: string
     email: string
     organizationName: string
     organizationType: string           // NEW
     phoneNumber: string                // NEW
     tinNumber: string                  // NEW
     address: { /* complete address */ } // NEW
   }
   ```

3. **Added `rememberMe` Support**
   - Optional boolean in request
   - Controls refreshToken expiration:
     - `rememberMe: true` → 30 days
     - `rememberMe: false` or omitted → 7 days
   - accessToken always expires in 15 minutes

4. **Frontend Needs Address for Direct Purchase**
   - Address returned in login response
   - No need to re-enter address when creating orders
   - Stored in Redux for reuse

---

### ✅ Section 4: Refresh Token

#### Complete Implementation Added:
1. **Endpoint Specification**
   - Request includes refreshToken
   - Success returns BOTH new accessToken AND new refreshToken
   - Failure (401) triggers logout

2. **Token Storage Strategies Documented**
   - httpOnly Cookie (Recommended - most secure)
   - localStorage (Simpler, less secure)
   - Clear guidance on which to use

3. **Auto-Refresh Flow**
   ```
   401 Error → Interceptor catches → Call refresh
   → Success: Update tokens + retry request
   → Failure: Logout + redirect to login
   ```

4. **Token Expiration Rules**
   - accessToken: 15 minutes (always)
   - refreshToken: 7 or 30 days (based on rememberMe)
   - Rolling refresh: New tokens issued on each refresh

5. **Remember Me Integration**
   - Login with rememberMe → longer refreshToken life
   - Refresh maintains original expiration type
   - Backend tracks this appropriately

---

## Database Implications

### New Fields Required:

**users/organizations table:**
```sql
- organization_name (string)
- organization_type (enum: School, University, etc.)
- phone_number (string, 10 digits)
- tin_number (string, 10 digits)
- email (string, unique)
- password_hash (string)
```

**addresses table (or embedded in users table):**
```sql
- user_id (foreign key)
- address_type (enum: 'autocomplete', 'manual')
- address_formatted (text, nullable)
- street (string, nullable)
- sub_city (string, nullable)
- area (string, nullable)
- city (string, default: 'Addis Ababa')
- region (string, default: 'Addis Ababa City Administration')
```

**refresh_tokens table:**
```sql
- token (string, unique)
- user_id (foreign key)
- expires_at (timestamp)
- created_at (timestamp)
- remember_me (boolean)
```

---

## Frontend Changes Required

### 1. Login Page Updates
- Add "Remember Me" checkbox
- Pass `rememberMe: true/false` to API

### 2. Registration Flow
- Already collecting correct data
- Change success redirect from `/login` to `/dashboard`
- Store authentication tokens after registration
- No changes to form fields needed

### 3. Redux Auth Slice
```typescript
interface AuthState {
  user: {
    id: string
    email: string
    organizationName: string
    organizationType: string      // NEW
    phoneNumber: string           // NEW
    tinNumber: string             // NEW
    address: Address              // NEW - full address object
  } | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  rememberMe: boolean             // NEW - track remember me state
  loading: boolean
  error: string | null
}
```

### 4. Axios Interceptor
```typescript
// Add request interceptor
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      
      try {
        const refreshToken = getRefreshToken() // from localStorage/cookie
        const { data } = await api.post('/auth/refresh', { refreshToken })
        
        // Update tokens in Redux
        store.dispatch(setTokens(data.data))
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api.request(error.config)
      } catch (refreshError) {
        // Refresh failed - logout user
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)
```

---

## UI Changes Required

### Login Page (Add Remember Me)
```tsx
// src/pages/Login.tsx
const [rememberMe, setRememberMe] = useState(false)

<div className="flex items-center gap-2">
  <input
    type="checkbox"
    id="rememberMe"
    checked={rememberMe}
    onChange={(e) => setRememberMe(e.target.checked)}
  />
  <label htmlFor="rememberMe" className="text-sm text-foreground">
    Remember me for 30 days
  </label>
</div>

// Pass to login action
dispatch(login({ email, password, rememberMe }))
```

### Registration Success Redirect
```tsx
// src/pages/Signup.tsx
// Current: navigate('/login')
// Change to: navigate('/dashboard')

// After successful registration response
if (registerResponse.success) {
  // Store tokens in Redux
  dispatch(setAuthTokens(registerResponse.data))
  // Redirect to dashboard
  navigate('/dashboard')
}
```

---

## Backend Business Logic

### Registration Flow:
1. Validate all input fields
2. Check email uniqueness
3. Hash password
4. Generate accessToken (15min expiration)
5. Generate refreshToken (7 days)
6. Store refreshToken in database
7. Return user data + tokens (auto-authenticate)

### Login Flow:
1. Validate credentials
2. Check rememberMe flag
3. Generate accessToken (15min expiration)
4. Generate refreshToken (7 or 30 days based on rememberMe)
5. Store refreshToken in database with expiration
6. Return user data + tokens

### Refresh Flow:
1. Validate refreshToken from request
2. Check expiration in database
3. Check if token was revoked/blacklisted
4. If valid:
   - Generate new accessToken
   - Generate new refreshToken (same expiration type as original)
   - Update database
   - Return both tokens
5. If invalid: Return 401

### Token Cleanup:
- Periodically delete expired refreshTokens from database
- On logout: Mark refreshToken as revoked/delete it

---

## Security Considerations

### Password Storage:
- Use bcrypt or Argon2 for hashing
- Never store plain-text passwords
- Minimum 8 characters enforced

### Token Security:
- JWT secret must be strong and environment-specific
- refreshToken should be long and random
- Store refreshToken hash in database (not plain text)
- Implement token rotation (rolling refresh)

### Address Data:
- Validate and sanitize all address inputs
- Geoapify addresses are trusted (external API)
- Manual addresses need XSS protection

### Rate Limiting:
- Login endpoint: 5 attempts per 15 minutes per IP
- Register endpoint: 3 attempts per hour per IP
- Refresh endpoint: 10 attempts per minute per token

---

## Testing Checklist

### Registration:
- [ ] Register with autocomplete address
- [ ] Register with manual address
- [ ] Verify all fields stored correctly
- [ ] Verify tokens returned
- [ ] Verify redirect to dashboard (not login)
- [ ] Verify user is authenticated immediately

### Login:
- [ ] Login without Remember Me
- [ ] Login with Remember Me checked
- [ ] Verify correct refreshToken expiration
- [ ] Verify complete user profile returned
- [ ] Verify address included in response
- [ ] Verify no `role` field in response

### Refresh Token:
- [ ] Access token expires → auto-refresh works
- [ ] Refresh token valid → new tokens issued
- [ ] Refresh token expired → user logged out
- [ ] Remember Me token lasts 30 days
- [ ] Normal token lasts 7 days
- [ ] Rolling refresh updates tokens

### Edge Cases:
- [ ] Multiple tabs → token refresh syncs
- [ ] Concurrent requests during refresh
- [ ] Network failure during refresh
- [ ] Invalid refresh token handling
- [ ] Logout clears all auth state

---

## Next Steps

**Iteration 2 will cover:**
- Section 5: Forgot Password (minor review)
- Section 6: Reset Password (minor review)
- Section 7: Dashboard Overview Data (major changes)
- Section 8: Direct Purchase (major changes)

**Key areas for Iteration 2:**
- Remove `recentOrders` redundancy
- Separate Order History from Basket History
- Fix savings calculations (vs Merkato, not platform price)
- Remove delivery address from direct purchase request
- Add Profile Edit page requirement

---

**Status:** ✅ Iteration 1 Complete - Sections 1-4 fully updated and internally consistent
