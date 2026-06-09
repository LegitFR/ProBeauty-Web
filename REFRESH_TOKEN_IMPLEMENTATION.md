# Automatic Token Refresh Implementation

## Overview

The application now automatically refreshes the access token using the refresh token when it expires, preventing users from being logged out unexpectedly.

## What's Changed

### 1. Core Infrastructure

#### `lib/utils/fetchWithAuth.ts` (NEW)

A new centralized fetch wrapper that:

- Automatically adds authentication headers
- Detects 401 errors caused by expired tokens
- Automatically refreshes the access token using the refresh token
- Retries the failed request with the new token
- Only logs the user out if token refresh fails

**Key Features:**

- Prevents multiple simultaneous refresh requests
- Provides both `fetchWithAuth()` for raw responses and `fetchJsonWithAuth()` for JSON responses
- Handles all authentication logic in one place

#### `lib/utils/authErrorHandler.ts` (UPDATED)

Enhanced to:

- Try refreshing the token before logging out the user
- Only show "session expired" if refresh fails
- Prevent duplicate refresh attempts

### 2. Updated API Files

The following API files have been updated to use `fetchWithAuth`:

✅ **Completed:**

- `lib/api/cart.ts` - All cart operations (get, add, update, remove, clear)
- `lib/api/booking.ts` - All booking operations (create, get, update, cancel, confirm, complete)
- `lib/api/favourite.ts` - All favourites operations (add, get, check, remove)

🔄 **Partially Updated (imports added):**

- `lib/api/order.ts` - Import added, functions need updating
- `lib/api/review.ts` - Import added, functions need updating
- `lib/api/notification.ts` - Import added, functions need updating

⏳ **Need Updating:**

- `lib/api/address.ts`
- `lib/api/staff.ts`
- `lib/api/service.ts`
- `lib/api/salon.ts`
- `lib/api/products.ts`

### 3. How It Works

#### Before (Old Flow):

```
Request → 401 Error → Immediate Logout → Show Login Modal
```

#### After (New Flow):

```
Request → 401 Error → Attempt Token Refresh → Success? → Retry Request
                                             ↓ Failure
                                           Logout → Show Login Modal
```

## Usage Examples

### For New API Functions

```typescript
import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";

// Simple JSON request
export async function getData(token: string): Promise<MyData> {
  return await fetchJsonWithAuth<MyData>(`${API_BASE_URL}/data`, {
    method: "GET",
  });
}

// POST with body
export async function createItem(token: string, data: ItemData): Promise<Item> {
  return await fetchJsonWithAuth<Item>(`${API_BASE_URL}/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Raw response handling
export async function uploadFile(
  token: string,
  formData: FormData,
): Promise<Response> {
  return await fetchWithAuth(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
}
```

### Migration Pattern

**Old Code:**

```typescript
const response = await fetch(`${API_BASE_URL}/items`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});

if (!response.ok) {
  const error = await response.json();
  if (response.status === 401 && isAuthExpired(error)) {
    handleAuthError(error);
    throw new Error("Session expired");
  }
  throw new Error(error.message || "Request failed");
}

return await response.json();
```

**New Code:**

```typescript
return await fetchJsonWithAuth<ResponseType>(`${API_BASE_URL}/items`, {
  method: "POST",
  body: JSON.stringify(data),
});
```

## Benefits

1. **Better User Experience**: Users stay logged in even if their access token expires
2. **Reduced Interruptions**: No need to re-authenticate every 15 minutes (or whatever the access token TTL is)
3. **Cleaner Code**: Authentication logic centralized in one place
4. **Consistent Behavior**: All API calls handle token refresh the same way
5. **Security**: Still logs out if refresh token is invalid/expired

## API Backend Requirements

The backend must support the following endpoint:

**POST** `/api/v1/auth/refresh-token`

```json
Request:
{
  "refreshToken": "string"
}

Response (Success):
{
  "accessToken": "new-jwt-token",
  "message": "Token refreshed successfully"
}

Response (Failure - 401):
{
  "message": "Invalid or expired refresh token"
}
```

## Environment Variables

Using the same backend API URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://probeauty-backend.onrender.com/api/v1
```

## Testing

To test the refresh token functionality:

1. **Login** to the application
2. **Wait** for the access token to expire (or manually expire it in localStorage)
3. **Perform an action** that requires authentication (e.g., add to cart)
4. **Observe**: The request should automatically refresh the token and complete successfully
5. **Check Console**: You should see logs like:
   ```
   [Fetch Auth] Access token expired, attempting refresh...
   [Fetch Auth] Successfully refreshed access token
   [Fetch Auth] Retrying request with new access token...
   ```

## Migration Checklist

For each API file that needs updating:

- [ ] Add import: `import { fetchWithAuth, fetchJsonWithAuth } from "@/lib/utils/fetchWithAuth";`
- [ ] Remove import: `import { isAuthExpired, handleAuthError } from "@/lib/utils/authErrorHandler";`
- [ ] For each function:
  - [ ] Replace manual `fetch()` with `fetchWithAuth()` or `fetchJsonWithAuth()`
  - [ ] Remove `Authorization: Bearer` header (automatically added)
  - [ ] Remove manual error handling for 401/token expiration
  - [ ] Simplify error handling to just throw/catch

## Notes

- The `token` parameter in API functions is still present but unused by `fetchWithAuth` (it reads from localStorage)
- This maintains backward compatibility
- Consider removing the `token` parameter in a future refactor
- The refresh token is stored in `localStorage` under the key `refreshToken`
- The access token is stored in `localStorage` under the key `accessToken`

## Next Steps

To complete the migration:

1. Update the remaining API files listed in the "Need Updating" section
2. Test each API function after migration
3. Monitor console for any authentication errors
4. Consider removing unused `token` parameters from function signatures
