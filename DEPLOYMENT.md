# Deployment Guide

This guide explains how to deploy and share your Personal Finance App.

## 1. Prerequisites
Before deploying, ensure you have the following installed:
-   **Node.js** (v18 or newer)
-   **Git** (for version control and easy deployment) - [Download here](https://git-scm.com/download/win)

## 2. Initialize Git (First Time Only)
If you haven't initialized a git repository yet, open your terminal in the project folder and run:


> **Tip: How to open logic terminal?**
> -   **VS Code (Easiest)**: Press `Ctrl + ~` (Control + Tilde) or click **Terminal > New Terminal** in the top menu.
> -   **Windows Explorer**: Open the folder, verify you see `package.json`, then type `cmd` or `powershell` in the address bar at the top and hit Enter.


> **Important:** When running these commands, copy **only** the text inside the box (e.g., `git init`), **do not** copy the backticks (```) or the word `bash`.

```bash
git init
git add .
git commit -m "Initial commit"
```

## 3. Firebase Deployment (Current Setup)

Your project is configured to use **Firebase Hosting** and **Firestore**.

### Standard Deployment
To deploy your application updates:

1.  **Build the application**:
    Always build first to ensure the latest code is ready for upload.
    ```bash
    npm run build
    ```

2.  **Deploy everything**:
    This updates the website, security rules, and database indexes.
    ```bash
    npx firebase deploy
    ```

### Targeted Deployment
If you only want to update specific parts:

-   **Update Website Only** (Fastest for UI changes):
    ```bash
    npx firebase deploy --only hosting
    ```

-   **Update Security Rules Only** (If you changed `firestore.rules`):
    ```bash
    npx firebase deploy --only firestore:rules
    ```

## 4. Troubleshooting

### "Insufficient Permissions" or Sync Errors
If users report sync errors, ensure the latest security rules are deployed:
```bash
npx firebase deploy --only firestore:rules
```

### "FirebaseAdapter not initialized"
This usually means a race condition in code. 
-   **Fix**: Ensure `FirebaseAdapter.ts` waits for `auth.onAuthStateChanged` before initializing.
-   **Force Sync**: Go to Settings > Cloud & Sync > Troubleshoot to force an upload of local data.

## 5. Local Preview
To preview the production build locally before deploying:
```bash
npm run preview
```

