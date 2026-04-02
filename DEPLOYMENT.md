# Deployment Guide

This project is a full-stack application built with React (Vite) on the frontend and Node.js (Express) with SQLite on the backend.

## Environment Variables

Before deploying, you must configure your environment variables. 
1. Copy `.env.example` to `.env`
2. Fill in the required values.

### Important Variables:
- `PORT`: The port your server will run on (default: 3000).
- `JWT_SECRET`: A strong, random string used for signing authentication tokens.
- `CORS_ORIGIN`: A comma-separated list of allowed frontend domains (e.g., `https://your-frontend.com`). Leave empty or use `*` to allow all origins.
- `DATABASE_URL`: (Optional) The absolute path to your SQLite database file. Defaults to `./database.sqlite`.
- `VITE_FIREBASE_*`: Your Firebase configuration keys.

## Hosting Platforms

### ⚠️ Important Note on Vercel and Netlify
This project uses **SQLite** (`better-sqlite3`) for its database. SQLite writes data to a local file (`database.sqlite`). 

**Vercel and Netlify are "Serverless" platforms.** This means they do not have a persistent file system. If you deploy this backend to Vercel or Netlify:
- The database will reset to empty every time the serverless function spins up.
- You will lose all your data (students, courses, etc.).

### Recommended Hosting Platforms (For SQLite)
To keep your data persistent, you must deploy this project to a platform that supports persistent disks or long-running containers.

**Top Recommendations:**
1. **Render (render.com)** - Use a "Web Service" with a "Disk" attached.
2. **Railway (railway.app)** - Add a persistent volume to your service.
3. **DigitalOcean / Linode / AWS EC2** - Any standard VPS.

## How to Deploy (Render / Railway / VPS)

1. **Push your code to GitHub.**
2. **Connect your repository** to Render or Railway.
3. **Set the Build Command:**
   ```bash
   npm install && npm run build
   ```
4. **Set the Start Command:**
   ```bash
   npm run start
   ```
5. **Add Environment Variables:** Add all the variables from your `.env` file into the platform's environment variable settings.
6. **(Crucial for Render/Railway)**: Create a persistent disk/volume and mount it to your application. Set the `DATABASE_URL` environment variable to point to a file inside that mounted volume (e.g., `/data/database.sqlite`).

## Frontend-Only Deployment (Vercel/Netlify)
If you decide to rewrite the backend to use Firebase Firestore completely (instead of SQLite), you can deploy the `dist` folder to Vercel or Netlify. However, currently, the app relies on the Express backend and SQLite for its core functionality.

## Local Development
To run the project locally:
```bash
npm install
npm run dev
```
