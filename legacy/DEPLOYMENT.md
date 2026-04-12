# Datawiser Deployment Guide

This guide explains how to deploy the Datawiser MVP using strictly free-tier services, keeping your budget at ₹0 as requested.

## 1. Backend Deployment (Render - Free Tier)

Render provides a completely free tier for web services (spins down after 15 mins of inactivity, which is fine for MVPs).

### Steps:
1. Push this entire repository to GitHub.
2. Create an account at [Render.com](https://render.com/).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. In the configuration:
   - **Name**: `datawiser-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Select the **Free** instance type.
7. Click **Create Web Service**. 
8. Render will provide a URL (e.g., `https://datawiser-backend.onrender.com`).
9. **Important**: Go to your frontend code (`frontend/src/App.jsx`) and replace `http://localhost:8000/api/clean` with your new Render URL (`https://.../api/clean`). Commit and push this change to GitHub.

## 2. Frontend Deployment (Vercel - Free Tier)

Vercel is the easiest and fastest way to host React/Vite applications for free.

### Steps:
1. Create an account at [Vercel.com](https://vercel.com/) and quickly connect your GitHub.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. In the configuration:
   - **Framework Preset**: Vercel should automatically detect `Vite`.
   - **Root Directory**: Click "Edit" and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.
6. Vercel will build and assign you a free live URL (e.g., `https://datawiser.vercel.app`).

## Congratulations!
Your application is now live on the internet with **₹0 hosting costs**.

- Your backend will process data instantly without saving anything to a database, eliminating DB storage costs entirely.
- Your frontend runs lightweight on Vercel's global edge network.
