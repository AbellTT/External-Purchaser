# Testing Guide for Registration and Redux

## Part 1: Test Registration ✅

### Step 1: Prepare Browser
1. Open browser in **Incognito/Private mode** (fresh start)
2. Press **F12** to open DevTools
3. Click **Redux** tab (should see `auth/initialize/rejected` - this is normal!)

### Step 2: Go to Signup
Navigate to: `http://localhost:5173/signup`

### Step 3: Fill Out Step 1 - Organization Details
```
Organization Name: Test University
Organization Type: University (from dropdown)
Phone Number: 0912345678
TIN Number: 1234567890
```
Click **"Continue to Address →"**

### Step 4: Fill Out Step 2 - Address Information
Select **"Manual Entry"** tab:
```
Street/Building Name: Churchill Road
Sub-City: Kirkos
Area/Neighborhood: Arat Kilo
City: Addis Ababa
Region: Addis Ababa City Administration
```
Click **"Continue to Account →"**

### Step 5: Fill Out Step 3 - Account Credentials
```
Email: procurement@testuniversity.edu.et
Password: Test123456
Confirm Password: Test123456
```
Click **"Create Account"**

### Step 6: Verify in Redux DevTools
1. Go to **Redux** tab → **Action** tab
2. You should see: `auth/register/fulfilled` ✅

3. Go to **State** tab
4. Expand `auth` → `user`
5. You should see YOUR data:
```javascript
{
  auth: {
    user: {
      id: "user_173889...",
      email: "procurement@testuniversity.edu.et",
      organizationName: "Test University", // ← YOUR INPUT!
      organizationType: "University",
      phoneNumber: "0912345678",
      address: {
        street: "Churchill Road",
        subCity: "Kirkos",
        city: "Addis Ababa",
        // ... YOUR ADDRESS DATA
      }
    },
    isAuthenticated: true,
    accessToken: "eyJhbG..."
  }
}
```

### Step 7: Check UI Updates
After clicking "Go to Dashboard":

1. **Sidebar** (left side) → Should show: **"Test University"** ✅
2. Click **"Profile"** → All fields filled with your registration data ✅
3. **Top bar** → Shows your organization name ✅

---

## Part 2: Test Overview Page (Dashboard Home)

**Note:** The Overview page is currently using hardcoded data. We'll connect it to Redux in the next session.

### For Now - Test What's Available:

1. After registration or login, you'll see Dashboard Home
2. Current data is hardcoded (not from Redux yet)
3. But you can verify Redux is working:

### Quick Redux Test:

Open browser console and run:
```javascript
// Check Redux state
const state = window.__REDUX_DEVTOOLS_EXTENSION__?.().getState()

// Check auth data
console.log('User:', state.auth.user)
console.log('Is Authenticated:', state.auth.isAuthenticated)

// Check all slices are registered
console.log('All slices:', Object.keys(state))
// Should show: ["auth", "dashboard", "products", "baskets", "orders", "marketIntelligence", "procurementCalendar", "notifications"]
```

---

## Part 3: Test Mock Data Changes

### Change Login Response

1. Edit `src/data/auth/loginResponse.json`
2. Change `organizationName` to: `"My Custom Organization"`
3. Save file
4. Clear browser storage:
   - F12 → Application → Clear storage → Clear site data
5. Login again
6. **Sidebar** and **Profile** should show: **"My Custom Organization"** ✅

### Change Registration

1. Go to `/signup`
2. Fill out form with different organization name
3. Complete registration
4. **Sidebar** immediately shows your new organization name ✅

---

## Verification Checklist

After registration, verify these work:

- [ ] ✅ Redux DevTools shows `auth/register/fulfilled`
- [ ] ✅ Redux state has `auth.user` with your data
- [ ] ✅ Sidebar shows your organization name
- [ ] ✅ Profile page has all your data filled in
- [ ] ✅ Refresh page → Still logged in (session persists)
- [ ] ✅ Change mock `loginResponse.json` → UI updates

---

## Troubleshooting

### Issue: "No Redux tab in DevTools"
**Solution:** Install Redux DevTools extension
- Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd

### Issue: Registration doesn't work
**Solution:**
1. Check browser console for errors (F12 → Console)
2. Make sure dev server is running (`npm run dev`)
3. Try clearing browser storage and trying again

### Issue: Sidebar still shows old organization name
**Solution:**
1. Open Application tab → Local Storage
2. Delete `refreshToken` key
3. Refresh page
4. Register/login again

### Issue: "auth/initialize/rejected" on every load
**Solution:** This is NORMAL! See `REDUX_INITIALIZATION_EXPLAINED.md`

---

## What's Working

✅ **Registration** - Saves your form data to Redux
✅ **Login** - Loads mock data into Redux  
✅ **Sidebar** - Reads organization name from Redux
✅ **Profile** - Reads all user data from Redux
✅ **Session Persistence** - Refresh page stays logged in
✅ **Mock Data** - Editing `loginResponse.json` updates UI

## What's NOT Connected Yet

❌ **Dashboard Overview** - Still using hardcoded data
❌ **Other Pages** - BasketSystem, DirectPurchase, etc. still hardcoded
❌ **Signup** - Not fully integrated (partially working)

We'll connect these in the next step!

---

## Next Steps

1. ✅ Test registration following this guide
2. ✅ Verify Redux state in DevTools
3. ✅ Check sidebar and profile show correct data
4. ➡️ After testing, we'll connect remaining pages to Redux

---

**Build Status:** ✅ Passing (after git checkout)
**Redux Status:** ✅ Working for auth, sidebar, profile
**Ready to Test:** ✅ YES!
