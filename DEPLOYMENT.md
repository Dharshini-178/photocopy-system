# Deployment Guide

Recommended setup:

- Frontend: Vercel
- Backend API: Railway
- Database: Railway MySQL

## 1. Push the project to GitHub

Deployments on Vercel and Railway are easiest from a GitHub repository.

## 2. Deploy the backend on Railway

Create a Railway project and add:

- one MySQL service
- one app service connected to this repository

For the backend service, use:

- Root Directory: `backend`
- Start Command: `npm start`

Environment variables for the backend:

- `PORT=5000`
- `DB_HOST=${{MySQL.MYSQLHOST}}`
- `DB_PORT=${{MySQL.MYSQLPORT}}`
- `DB_USER=${{MySQL.MYSQLUSER}}`
- `DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}`
- `DB_NAME=${{MySQL.MYSQLDATABASE}}`
- `CORS_ORIGIN=https://your-frontend-domain.vercel.app`

After the MySQL service is ready, open the MySQL service and run the SQL from:

- `backend/schema.sql`

Then deploy the backend and copy the public backend URL, for example:

- `https://your-backend-name.up.railway.app`

Health check endpoint:

- `/api/health`

## 3. Deploy the frontend on Vercel

Import the same repository into Vercel.

Use these settings:

- Framework Preset: `Vite`
- Root Directory: `.`
- Build Command: `npm run build`
- Output Directory: `dist`

Frontend environment variable:

- `VITE_API_URL=https://your-backend-name.up.railway.app/api`

Redeploy after saving the environment variable.

## 4. Test after deployment

1. Open the deployed frontend.
2. Register a new staff account.
3. Log out.
4. Open the app on another device.
5. Log in with the same account.

If login fails on another device, check:

- backend URL is correct in `VITE_API_URL`
- backend service is running
- Railway MySQL schema was imported
- `CORS_ORIGIN` exactly matches the frontend domain
