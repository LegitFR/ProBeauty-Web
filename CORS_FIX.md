# CORS Fix - API Proxy Implementation

## Problem

CORS error when trying to access the backend API from localhost:3000:

```
Access to fetch at 'https://probeauty-backend.onrender.com/api/v1/auth/signup'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution Implemented

### Next.js API Proxy Route

Created a proxy route that forwards all authentication requests through your Next.js server, avoiding CORS issues entirely.

**File Created:** `app/api/auth/[...path]/route.ts`

This catch-all route:

- Intercepts all requests to `/api/auth/*`
- Forwards them to `https://probeauty-backend.onrender.com/api/v1/auth/*`
- Returns the backend response to the frontend

### Updated Auth Client

**File Modified:** `lib/api/auth.ts`

Changed:

```typescript
// OLD - Direct backend calls (CORS error)
const API_BASE_URL = "https://probeauty-backend.onrender.com/api/v1";

// NEW - Local proxy (no CORS issues)
const API_BASE_URL = "/api/auth";
```

All auth functions now call:

- `/api/auth/signup` → proxies to → `https://probeauty-backend.onrender.com/api/v1/auth/signup`
- `/api/auth/login` → proxies to → `https://probeauty-backend.onrender.com/api/v1/auth/login`
- And so on...

## How It Works

### Request Flow:

```
Frontend Component
    ↓ (calls)
lib/api/auth.ts function
    ↓ (fetch to)
/api/auth/[endpoint]
    ↓ (Next.js API route)
app/api/auth/[...path]/route.ts
    ↓ (proxies to)
https://probeauty-backend.onrender.com/api/v1/auth/[endpoint]
    ↓ (backend processes)
Returns response
    ↓ (back through proxy)
Frontend receives data
```

### Benefits:

1. ✅ **No CORS issues** - All requests appear to come from the same origin
2. ✅ **Backend URL hidden** - Frontend only knows `/api/auth`, not the actual backend URL
3. ✅ **Works in development and production** - No special configuration needed
4. ✅ **No code changes in components** - All existing auth code works as-is

## Testing

Your authentication should now work without CORS errors:

1. **Try Signup:**

   - Fill the signup form
   - Click "Create Account"
   - Should receive OTP email without CORS error

2. **Try Login:**

   - Enter credentials
   - Click "Sign In"
   - Should login successfully

3. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - You'll see requests to `/api/auth/signup`, `/api/auth/login`, etc.
   - All with status 200 (or appropriate status codes)
   - No more CORS errors!

## Alternative Solutions

### If Backend Team Has Access:

They could fix CORS on their end by adding this middleware:

```javascript
// Backend server.js or app.js
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Development
      "https://your-domain.com", // Production
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### For Production Deployment:

The proxy solution works for both development and production. When you deploy your Next.js app:

- Your domain: `https://probeauty.com`
- API routes: `https://probeauty.com/api/auth/*`
- Backend: `https://probeauty-backend.onrender.com` (hidden)

No additional configuration needed!

## Important Notes

1. **Environment Variables (Optional Enhancement):**
   You could move the backend URL to an environment variable:

   ```typescript
   // In app/api/auth/[...path]/route.ts
   const BACKEND_URL =
     process.env.BACKEND_API_URL ||
     "https://probeauty-backend.onrender.com/api/v1/auth";
   ```

   Then in `.env.local`:

   ```
   BACKEND_API_URL=https://probeauty-backend.onrender.com/api/v1/auth
   ```

2. **Rate Limiting:**
   The backend's rate limiting (50 req/15min) still applies since requests ultimately go to the backend.

3. **Error Handling:**
   The proxy passes through all status codes and error messages from the backend, so your existing error handling continues to work.

## File Structure

```
pro-beauty-web/
├── app/
│   └── api/
│       └── auth/
│           └── [...path]/
│               └── route.ts          ← NEW: Proxy route
├── lib/
│   └── api/
│       └── auth.ts                   ← UPDATED: Now uses /api/auth
└── components/
    └── AuthModal.tsx                 ← No changes needed
```

## Summary

The CORS issue is now resolved! Your frontend makes requests to your own Next.js API routes (`/api/auth/*`), which then proxy those requests to the backend. This is a common and recommended pattern for Next.js applications that need to interact with external APIs.

You can now test the authentication flow without any CORS errors. 🎉
