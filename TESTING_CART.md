# Cart API Testing Guide

## Quick Test Commands

### Start Development Server

```bash
npm run dev
```

### Test Environment Variables

```bash
# Check if BACKEND_API_URL is set
echo $BACKEND_API_URL
```

## Manual Testing Steps

### 1. Guest User Cart (localStorage)

**Test Add to Cart:**

1. Open http://localhost:3000
2. Scroll to "Shop" section
3. Click "Add to Cart" on any product
4. Check browser console: should see "Added to cart" toast
5. Click cart icon (top right)
6. Verify product appears in cart drawer

**Test Update Quantity:**

1. In cart drawer, click + button
2. Verify quantity increases
3. Verify total price updates
4. Open DevTools → Application → localStorage
5. Verify cart array has updated quantity

**Test Remove Item:**

1. In cart drawer, click trash icon
2. Verify item removed
3. Verify total price updates
4. Check localStorage - item should be removed

**Test Persistence:**

1. Add items to cart
2. Refresh page (F5)
3. Open cart drawer
4. Verify items still there

### 2. Authenticated User Cart (API)

**Test Login Sync:**

1. Add 2-3 products to cart as guest
2. Open cart drawer - verify items
3. Click "Login" button
4. Login with credentials
5. Wait for page refresh
6. Open cart drawer
7. Verify all guest cart items synced to API

**Test Add to Cart (API):**

1. Ensure logged in
2. Add product to cart
3. Open browser DevTools → Network tab
4. Filter by "cart"
5. Verify POST request to `/api/cart/items`
6. Verify 200 status code
7. Check response - should have cart data

**Test Update Quantity (API):**

1. Logged in with items in cart
2. Open cart drawer
3. Click + or - buttons
4. Check Network tab
5. Verify PATCH request to `/api/cart/items/:productId`
6. Verify quantity updated in response

**Test Remove Item (API):**

1. Logged in with items in cart
2. Open cart drawer
3. Click trash icon
4. Check Network tab
5. Verify DELETE request to `/api/cart/items/:productId`
6. Verify item removed

**Test Cart Persistence (API):**

1. Logged in with items in cart
2. Refresh page
3. Check Network tab
4. Verify GET request to `/api/cart`
5. Open cart drawer
6. Verify all items loaded from API

**Test Clear Cart:**

1. Logged in with items in cart
2. Go to checkout page
3. After order (when implemented), cart should clear
4. Or manually clear via API

### 3. Cross-Tab Sync

**Test Login Detection:**

1. Open site in Chrome
2. Open site in incognito/another browser
3. Login in tab 1
4. Switch to tab 2
5. Tab 2 should detect login (storage event)
6. Reload tab 2 if needed
7. Cart should sync

### 4. API Proxy Routes

**Test GET Cart:**

```bash
# Get user token from localStorage
# Then test with curl:
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test Add Item:**

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"productId": "PRODUCT_ID", "quantity": 1}'
```

**Test Update Item:**

```bash
curl -X PATCH http://localhost:3000/api/cart/items/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

**Test Remove Item:**

```bash
curl -X DELETE http://localhost:3000/api/cart/items/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test Clear Cart:**

```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Browser Console Tests

### Check Auth Status:

```javascript
// Open browser console (F12)
const user = JSON.parse(localStorage.getItem("user"));
console.log("Logged in:", !!user?.token);
console.log("Token:", user?.token);
```

### Check Guest Cart:

```javascript
const cart = JSON.parse(localStorage.getItem("cart"));
console.log("Cart items:", cart);
```

### Test API Call Manually:

```javascript
const user = JSON.parse(localStorage.getItem("user"));
fetch("/api/cart", {
  headers: { Authorization: `Bearer ${user.token}` },
})
  .then((r) => r.json())
  .then((data) => console.log("Cart:", data));
```

## Expected Network Requests

### Guest User (No network calls):

- Add to cart: No network request
- Update: No network request
- Remove: No network request
- All operations use localStorage

### Authenticated User:

- **Add to cart:** POST `/api/cart/items`
- **Update quantity:** PATCH `/api/cart/items/:productId`
- **Remove item:** DELETE `/api/cart/items/:productId`
- **Load cart:** GET `/api/cart` (on page load)
- **Clear cart:** DELETE `/api/cart`

### Login Flow:

1. POST `/api/v1/auth/login` (from auth.ts)
2. Multiple POST `/api/cart/items` (sync guest cart)
3. GET `/api/cart` (load backend cart)
4. Page refreshes

## Error Scenarios

### Test 401 Unauthorized:

1. Delete user from localStorage
2. Try to manually call API
3. Should return 401

### Test Invalid Product ID:

1. Try adding non-existent product
2. Should handle gracefully

### Test Network Failure:

1. Stop backend server (if testing locally)
2. Try cart operations
3. Should fallback to localStorage
4. Should show error toast

## Success Criteria

✅ Guest cart works without login
✅ Guest cart syncs to backend on login
✅ All cart operations call API when authenticated
✅ Cart persists across page refreshes
✅ Network requests use Bearer token
✅ No direct calls to backend URL (only /api/cart)
✅ Errors handled gracefully
✅ Loading states shown
✅ Toast notifications displayed

## Common Issues & Fixes

### Cart not syncing on login:

- Check if `syncCartWithBackend()` is called
- Verify token in localStorage
- Check browser console for errors
- Verify Network tab shows POST requests

### Items not appearing:

- Check localStorage for guest cart
- Check Network tab for API responses
- Verify product IDs are correct
- Check backend API status

### 401 Errors:

- Token expired - re-login
- Token format wrong - check Bearer prefix
- User object corrupted - clear localStorage

### CORS Errors:

- Should NOT happen (using proxy)
- If occurs, verify API routes are correct
- Check BACKEND_API_URL in .env.local

## Debugging Tips

1. **Enable verbose logging:**

   - Open CartContext.tsx
   - Check console.error statements
   - Add more console.log if needed

2. **Check Network tab:**

   - Filter by "cart"
   - Look for status codes
   - Check request/response payloads

3. **Verify auth token:**

   ```javascript
   localStorage.getItem("user");
   ```

4. **Test API routes directly:**

   - Use curl or Postman
   - Verify routes respond correctly

5. **Check backend API:**
   - Verify backend is running
   - Test backend endpoints directly
   - Check backend logs for errors
