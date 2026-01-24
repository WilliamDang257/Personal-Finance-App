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

## 3. Option 1: Web Deployment (Recommended)
The easiest way to share the app is to deploy it to **Vercel** or **Netlify**. Both are free for personal use and work seamlessly with Vite apps.

### Using Vercel
1.  Create a fresh repository on [GitHub](https://github.com/new).
2.  Push your code to GitHub:
    ```bash
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```
3.  Go to [Vercel](https://vercel.com) and sign up/log in.
4.  Click **"Add New..."** -> **"Project"**.
5.  Import your GitHub repository.
6.  Vercel will detect "Vite" automatically. Click **Deploy**.
7.  Once done, you will get a live URL (e.g., `https://your-finance-app.vercel.app`) to share.

### Using Netlify
1.  Push your code to GitHub (same as above).
2.  Go to [Netlify](https://netlify.com) and sign up/log in.
3.  Click **"Add new site"** -> **"Import an existing project"**.
4.  Connect GitHub and select your repository.

### Alternative: Netlify "Drag and Drop" (No Git required)
If you don't want to use Git, you can do a manual deployment:
1.  Run `npm run build` in your terminal.
2.  This generates a `dist` folder in your project.
3.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
4.  Drag your `dist` folder onto the page.
5.  It will be deployed immediately!
*Note: To update the app later, you must rebuild and drag the new folder again manually.*


## 4. Option 2: Local Build (Advanced)
If you prefer not to host it online or want to run it locally without development mode:

1.  Build the project:
    ```bash
    npm run build
    ```
2.  This creates a `dist` folder containing the optimized app.
3.  To preview it locally, run:
    ```bash
    npm run preview
    ```
    Or use a static file server like `serve`:
    ```bash
    npx serve dist
    ```

> **Note**: You cannot simply open `dist/index.html` in your browser due to security restrictions (CORS/Modules). You must use a local web server as shown above.
