# Render Deployment Guide

## ⚠️ Critical: Database Setup Required

The app **cannot start** without a database. Render does not provide a MySQL/PostgreSQL server out-of-the-box. You must provision a database and configure the environment variables.

---

## Option 1: Use Render's Free PostgreSQL (Recommended)

### Step 1: Create a PostgreSQL Database on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Choose:
   - **Name**: `bookstore-db`
   - **Region**: Same as your web service (e.g., Oregon)
   - **Plan**: Free
4. Click **"Create Database"**
5. Wait for it to provision (~1 minute)
6. Copy the **Internal Database URL** and **External Database URL**

### Step 2: Configure Environment Variables on Render Web Service
1. Go to your **Web Service** dashboard
2. Click **"Environment"** tab
3. Add the following environment variables:

| Key | Value |
|-----|-------|
| `DB_DIALECT` | `postgres` |
| `DB_HOST` | `<from Internal Database URL hostname>` |
| `DB_PORT` | `5432` |
| `DB_USER` | `<from Internal Database URL username>` |
| `DB_PASS` | `<from Internal Database URL password>` |
| `DB_NAME` | `<from Internal Database URL database>` |
| `DB_SSL` | `true` (or `false` if using Internal URL) |
| `JWT_SECRET` | A long random string (min 32 chars) |
| `NODE_ENV` | `production` |

**Tip:** When using Render's PostgreSQL, you can also just paste the **Internal Database URL** into a single `DATABASE_URL` variable and modify the code to use it. But the current config uses individual variables.

### Step 3: Redeploy
1. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
2. Watch the logs to confirm successful connection

---

## Option 2: Use External MySQL Service

If you prefer to keep MySQL, use one of these free providers:
- **Aiven** (https://aiven.io) - Free MySQL tier
- **PlanetScale** (https://planetscale.com) - Free tier (Hobby)
- **Railway** (https://railway.app) - Free trial
- **FreeSQLDatabase** (https://freesqldatabase.com) - Free

### Environment Variables for MySQL:
| Key | Value |
|-----|-------|
| `DB_DIALECT` | `mysql` |
| `DB_HOST` | `<your MySQL host>` |
| `DB_PORT` | `3306` |
| `DB_USER` | `<your MySQL user>` |
| `DB_PASS` | `<your MySQL password>` |
| `DB_NAME` | `<your database name>` |

---

## Health Check

After deployment, your app exposes a health check endpoint:
- **URL**: `https://your-app.onrender.com/health`
- **Expected Response**: `{"status":"ok","timestamp":"..."}`

---

## Troubleshooting

### "ECONNREFUSED" error
- Your database is not accessible from Render
- Check that environment variables are set correctly
- For PostgreSQL on Render, use the **Internal Database URL** hostname, not external

### "Database connected successfully" but app crashes
- Check that all required models can sync
- Look for syntax errors in the logs

### "alter: true" causing index conflicts
- We use `alter: false` in production
- If you need to update schema, drop tables manually or run migrations

---

## Quick Test
After successful deployment, test these endpoints:
- `GET /health` - Health check
- `GET /api/books` - List books (should return empty array initially)
