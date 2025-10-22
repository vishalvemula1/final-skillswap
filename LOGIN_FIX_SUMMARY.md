# Login Fix Summary

## Problem Identified
The frontend was using **relative API paths** (e.g., `/api/auth/login/`) which failed when the frontend and backend were deployed on different domains in Render.

When accessing `https://skillswap-frontend.onrender.com`, requests to `/api/auth/login/` were resolving to:
- ❌ `https://skillswap-frontend.onrender.com/api/auth/login/` (WRONG - frontend domain)
- ✅ Should be `https://skillswap-backend.onrender.com/api/auth/login/` (CORRECT - backend domain)

## Solution Implemented

### 1. Created Centralized API Configuration
**File:** `frontend/src/config/api.js`
- Reads `REACT_APP_API_URL` environment variable from Render
- Falls back to `http://localhost:8000/api` for local development
- Exports `API_URL` constant for use across components

### 2. Updated All Frontend Components
Updated 5 components to use absolute URLs instead of relative paths:

| Component | Updated Endpoints |
|-----------|------------------|
| **Login.js** | `/auth/register/` → `{API_URL}/auth/register/` |
| | `/auth/login/` → `{API_URL}/auth/login/` |
| **App.js** | `/api/profile/` → `{API_URL}/profile/` |
| | `/api/auth/logout/` → `{API_URL}/auth/logout/` |
| **Dashboard.js** | `/api/profile/` → `{API_URL}/profile/` |
| | `/api/requests/` → `{API_URL}/requests/` |
| **BrowseSkills.js** | `/api/categories/` → `{API_URL}/categories/` |
| | `/api/skills/browse/` → `{API_URL}/skills/browse/` |
| | `/api/requests/send/` → `{API_URL}/requests/send/` |
| **MyRequests.js** | `/api/requests/` → `{API_URL}/requests/` |
| | `/api/requests/{id}/update/` → `{API_URL}/requests/{id}/update/` |
| **Profile.js** | `/api/profile/` → `{API_URL}/profile/` |
| | `/api/skills/` → `{API_URL}/skills/` |
| | `/api/categories/` → `{API_URL}/categories/` |
| | `/api/profile/update/` → `{API_URL}/profile/update/` |
| | `/api/profile/add-skill/` → `{API_URL}/profile/add-skill/` |

### 3. Environment Configuration
**In render.yaml:**
```yaml
envVars:
  - key: REACT_APP_API_URL
    value: "https://skillswap-backend.onrender.com/api"
```

## Testing the Fix

### Local Testing
```bash
# Start backend
cd backend
python manage.py runserver

# Start frontend (in new terminal)
cd frontend
npm start

# Test login with:
# - Email: admin@test.com
# - Password: admin123
# - Or any demo user (raj@example.com, etc.) with password: demo123
```

### Render Testing
1. Wait for Render to redeploy (check your Render dashboard)
2. Visit: https://skillswap-frontend.onrender.com
3. Click **Login**
4. Enter credentials:
   - **Email:** admin@test.com
   - **Password:** admin123
5. Click **Login** - you should now see the Dashboard

## Demo User Credentials
All demo users have password: `demo123`

| Email | Role | Password |
|-------|------|----------|
| admin@test.com | Admin | admin123 |
| raj@example.com | User | demo123 |
| priya@example.com | User | demo123 |
| amit@example.com | User | demo123 |
| sneha@example.com | User | demo123 |
| rohan@example.com | User | demo123 |
| neha@example.com | User | demo123 |
| arjun@example.com | User | demo123 |
| divya@example.com | User | demo123 |

## What Changed
- Created: `frontend/src/config/api.js` (NEW)
- Modified: `frontend/src/components/Login.js`
- Modified: `frontend/src/components/App.js`
- Modified: `frontend/src/components/Dashboard.js`
- Modified: `frontend/src/components/BrowseSkills.js`
- Modified: `frontend/src/components/MyRequests.js`
- Modified: `frontend/src/components/Profile.js`

## Git Commit
```
Commit: Fix frontend API URLs for cross-domain compatibility on Render
Files: 8 changed, 73 insertions(+), 17 deletions(-)
Status: ✅ Pushed to GitHub
```

## Next Steps
1. Render will auto-redeploy the frontend service
2. Check Render dashboard for deployment status
3. Visit https://skillswap-frontend.onrender.com and test login
4. If still not working, check Render logs for errors

## Troubleshooting
If login still doesn't work:

1. **Check Render Logs:**
   - Go to Render Dashboard → skillswap-frontend service
   - Check "Logs" tab for JavaScript errors
   - Check "Events" tab for build/deployment errors

2. **Verify Backend:**
   - Visit https://skillswap-backend.onrender.com/api/auth/login/ (should return 405 Method Not Allowed)
   - This confirms backend is running

3. **Check Network Requests:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try login
   - Look for failed requests to `https://skillswap-backend.onrender.com/api/auth/login/`
   - Check response for error details

4. **CORS Issues:**
   - If you see CORS errors, backend may not have CORS properly configured
   - Check `backend/skillswap_project/settings.py` CORS configuration
