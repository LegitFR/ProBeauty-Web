# Google OAuth Setup Instructions

## Prerequisites

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

## Step 1: Enable Google Sign-In API

1. Navigate to **APIs & Services** > **Library**
2. Search for "Google+ API" or "Google Identity"
3. Click **Enable**

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: ProBeauty Web App
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for development)
     - Your production URL
5. Click **Create**
6. Copy the **Client ID** (it will look like: `xxxxx.apps.googleusercontent.com`)

## Step 3: Configure Environment Variables

1. Open `.env.local` file in the root directory
2. Replace the placeholder with your actual Google Client ID:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```
3. Save the file
4. Restart your development server (`npm run dev`)

## Step 4: Backend Configuration

Make sure your backend has these environment variables set:

- `GOOGLE_CLIENT_ID` - Same as your frontend Client ID
- `GOOGLE_CLIENT_SECRET` - Get this from Google Cloud Console (OAuth 2.0 credentials page)

## Testing

1. Open your app at `http://localhost:3000`
2. Click on "Log in" or "Sign Up"
3. Click the "Sign in with Google" or "Sign up with Google" button
4. A Google sign-in popup should appear
5. Sign in with your Google account
6. You should be redirected back and logged in automatically

## Features

- ✅ Works for both Sign In and Sign Up
- ✅ Automatically links Google account if email already exists
- ✅ New users are created with `role: customer`, `isActive: true`, `otpVerified: true`
- ✅ Bypasses OTP verification for Google OAuth users
- ✅ Beautiful gradient UI with Google branding

## Troubleshooting

- **"Sign in with Google" button doesn't work**: Make sure you've added your Google Client ID to `.env.local`
- **Popup blocked**: Allow popups for your localhost domain
- **"Error: idpiframe_initialization_failed"**: Make sure your domain is added to authorized JavaScript origins
- **Backend errors**: Ensure your backend has the correct Google Client ID and Secret configured
