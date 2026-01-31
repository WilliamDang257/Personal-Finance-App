# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Project name: `personal-finance-app` (or your preferred name)
4. Disable Google Analytics (not needed for personal use)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click "Get started"
3. Click on **Google** sign-in provider
4. Enable the toggle
5. Set support email (your email)
6. Click "Save"

## Step 3: Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click "Create database"
3. **Start in production mode** (we'll use our custom rules)
4. Choose location: `asia-southeast1` (Singapore) or closest to you
5. Click "Enable"

## Step 4: Deploy Security Rules

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Accept default for Firestore rules file (`firestore.rules`)
   - Accept default for Firestore indexes file

4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Step 5: Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app:
   - App nickname: "Personal Finance Web"
   - No need to set up Firebase Hosting
   - Click "Register app"
5. Copy the firebaseConfig object

## Step 6: Configure Environment Variables

1. In your project root, create `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

2. Paste your Firebase config values:
   ```env
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

3. Save the file

## Step 7: Test

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Try signing in via the Settings page (once UI is implemented)

## Security Rules Explanation

The deployed `firestore.rules` ensures:
- ✅ Only authenticated users can access data
- ✅ Users can only read/write their own data
- ✅ Data is stored under `/users/{userId}/`
- ✅ All other access is denied

## Verify Setup

Check that everything is configured:

1. **Authentication**: Go to Firebase Console → Authentication → Sign-in method
   - Google should be "Enabled"

2. **Firestore**: Go to Firebase Console → Firestore Database
   - Should see "Cloud Firestore" (not Realtime Database)
   - Click "Rules" tab → Should see custom rules deployed

3. **Environment Variables**: In your project
   - `.env.local` file exists
   - All VITE_FIREBASE_* variables are set

## Troubleshooting

**Error: "Firebase config not found"**
- Check that `.env.local` file exists
- Check that all VITE_FIREBASE_* variables are set
- Restart dev server

**Error: "Permission denied"**
- Check Firestore rules are deployed
- Verify user is signed in
- Check browser console for detailed error

**Error: "User not authenticated"**
- Make sure Google Sign-In is enabled in Firebase Console
- Check that auth is initialized before using adapters

## Next Steps

Once Firebase is set up:
1. Implement UI for storage mode selection (SettingsPage)
2. Create Login page for authentication
3. Test cloud sync functionality
4. Deploy to Vercel with environment variables
