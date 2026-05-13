# CDLU Attendance System

A full-stack attendance management app built with React, Vite, Express, and MongoDB.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add your MongoDB Atlas URI:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Production Build

```bash
npm run build
npm start
```

## GitHub Pages Static Deployment

This repository includes `.github/workflows/deploy-github-pages.yml`. On every push to `main` or `master`, GitHub Actions builds the Vite app and deploys `dist` to GitHub Pages.

By default, the GitHub Pages build runs as a static browser app. If `VITE_API_BASE_URL` is empty, the app stores users, courses, students, attendance records, and backups in the browser's `localStorage` under `cdlu_db_state`. This keeps the core attendance workflow working without a backend.

Important: browser-local data is stored only on that device/browser. Use the Account Settings backup/export feature before clearing browser data or switching devices.

If you want shared data across devices, host the Express/MongoDB API in `server.ts` separately, for example on Render, Railway, or another Node host.

1. Host the backend and note its public URL, for example:

   ```txt
   https://your-backend.onrender.com
   ```

2. In GitHub, go to `Settings > Secrets and variables > Actions > Variables` and add:

   ```txt
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

3. Go to `Settings > Pages` and set `Source` to `GitHub Actions`.

4. Push to `main` or run the workflow manually from the Actions tab.

The GitHub Pages build uses hash routing so refreshes and nested routes work on static hosting.

## Render Settings

Use these settings when creating the Render Web Service:

```txt
Build Command: npm install && npm run build
Start Command: npm start
```

Environment variables:

```txt
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=https://your-username.github.io
```
