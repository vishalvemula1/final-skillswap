# SkillSwap Deployment Guide - Render.com

## Quick Start (5 minutes)

### Step 1: Create a Render Account
1. Go to https://render.com
2. Sign up with GitHub (easier!)
3. Authorize Render to access your GitHub repositories

### Step 2: Deploy to Render

**Option A: Using Render Dashboard (Recommended for beginners)**

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account if not already connected
4. Search for repository: `vishalvemula1/final-skillswap`
5. Select it and click **"Connect"**
6. Name your service group: `skillswap-deployment`
7. Click **"Create Blueprint"**

Render will automatically:
- Read `render.yaml` configuration
- Create backend service (Django)
- Create frontend service (React)
- Create PostgreSQL database
- Deploy everything!

**This takes 10-15 minutes.**

### Step 3: Configure Environment Variables

After deployment, go to each service and add:

**For Backend (skillswap-backend):**
- Go to Settings tab
- Add these environment variables:
  - `DEBUG`: `False`
  - `ALLOWED_HOSTS`: `skillswap-backend.onrender.com,skillswap-frontend.onrender.com`
  - `CORS_ALLOWED_ORIGINS`: `https://skillswap-frontend.onrender.com`
  - `SECRET_KEY`: (already auto-generated)

**For Frontend (skillswap-frontend):**
- Go to Settings tab
- Add:
  - `REACT_APP_API_URL`: `https://skillswap-backend.onrender.com/api`

### Step 4: Verify Deployment

1. Check backend health:
   - Visit: `https://skillswap-backend.onrender.com/api/`
   - Should see Django API response

2. Check frontend:
   - Visit: `https://skillswap-frontend.onrender.com`
   - Should see React app loading

3. Monitor logs:
   - Go to each service → "Logs" tab
   - Check for errors during deployment

---

## Troubleshooting

### Backend Won't Deploy
- Check logs: Services → skillswap-backend → Logs
- Common issues:
  - Database connection failed → Check DATABASE_URL is set
  - Missing dependencies → Update `backend/requirements.txt`
  - Static files error → Already handled by `build.sh`

### Frontend Shows "Cannot reach backend"
- Check backend service is running
- Verify `REACT_APP_API_URL` is set correctly in frontend
- Check CORS settings in backend

### Database Connection Issues
- PostgreSQL is automatically created
- Database name is: `skillswap`
- Check DATABASE_URL environment variable is set

---

## What Gets Deployed?

From `render.yaml`:

**Backend Service:**
- Python 3.11
- Django REST framework
- Gunicorn WSGI server
- Runs `build.sh` → Collects static files, runs migrations
- Listens on port determined by Render

**Frontend Service:**
- Node.js
- React build
- Static site hosting
- Built with `npm run build`
- Calls backend via `REACT_APP_API_URL`

**Database:**
- PostgreSQL (free tier)
- Automatic backups
- Auto-paused after 15 mins of inactivity (free tier behavior)

---

## Important Notes

1. **Free Tier Limitations:**
   - Services auto-pause after 15 minutes of inactivity
   - First request takes 30-50 seconds to wake up
   - Suitable for demos/projects, not production

2. **Database:**
   - Render creates PostgreSQL automatically
   - Migration from MySQL to PostgreSQL happens automatically
   - Data is seeded automatically

3. **Updates:**
   - Push changes to GitHub → Render auto-deploys (if auto-deploy enabled)
   - Takes 2-5 minutes per deployment

4. **Custom Domain:**
   - Can add custom domain in Service Settings
   - Requires DNS configuration

---

## Manual Deployment Commands (Alternative)

If you want to use Render CLI instead:

```bash
# Install Render CLI
npm install -g @render-com/cli

# Login to Render
render login

# Deploy
render deploy --service-name skillswap-backend
```

But the Blueprint method (Step 2) is easier for beginners!

---

## Need Help?

1. Check Render docs: https://render.com/docs
2. Check deployment logs in Render dashboard
3. Verify GitHub repo is public and has all files
4. Ensure `render.yaml` is in root directory

**Happy Deploying! 🚀**
