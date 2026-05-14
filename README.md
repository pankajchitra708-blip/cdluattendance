# CDLU Attendance System

A Vite + React attendance management app made for static hosting on GitHub Pages.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the local Vite server:

   ```bash
   npm run dev
   ```

3. Create a production build:

   ```bash
   npm run build
   ```

## GitHub Pages Deployment

This repository includes `.github/workflows/deploy-github-pages.yml`.

On every push to `main` or `master`, GitHub Actions builds the Vite app and deploys `dist` to GitHub Pages.

To enable it in GitHub:

1. Open the repository on GitHub.
2. Go to `Settings > Pages`.
3. Set `Source` to `GitHub Actions`.
4. Push to `main`, or run the workflow manually from the `Actions` tab.

Live URL format:

```txt
https://pankajchitra708-blip.github.io/cdluattendance/
```

## Data Storage

This app is frontend-only. It stores users, courses, students, attendance records, and backups in the browser's `localStorage` under `cdlu_db_state`.

Important: browser-local data is stored only on that device/browser. Use the Account Settings backup/export feature before clearing browser data or switching devices.
