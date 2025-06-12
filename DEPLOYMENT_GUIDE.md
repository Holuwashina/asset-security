# 🚀 Vercel Deployment Guide - Asset Classification App

Deploy your complete Next.js frontend + Django API on Vercel with real backend integration.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [GitHub Account](https://github.com) 
- [Node.js](https://nodejs.org/) installed locally
- [Python 3.9+](https://python.org/) installed locally

## 🏗️ Project Structure

```
asset-classification/
├── src/                     # Next.js frontend
│   ├── lib/
│   │   ├── api.ts          # Django API client
│   │   └── hooks/useAssets.ts # React Query hooks
├── api/                     # Django backend
│   ├── assets_management/   # Django app
│   ├── requirements.txt     # Python dependencies
│   ├── vercel_app.py       # Vercel entry point
│   └── deployment_settings.py # Production settings
├── vercel.json             # Vercel configuration
├── .env.example            # Environment variables template
└── DEPLOYMENT_GUIDE.md     # This file
```

## 🔧 Step 1: Configure Environment Variables

### 1.1 Create Local Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Edit for local development
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 1.2 Production Environment Variables

Set these in Vercel dashboard (Project → Settings → Environment Variables):

```bash
# Required for Django API
SECRET_KEY=your-super-secure-secret-key-here-min-50-chars
DJANGO_SETTINGS_MODULE=assets_management.deployment_settings

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app/api

# Database (optional - uses SQLite by default)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Configuration  
FRONTEND_URL=https://your-app-name.vercel.app
```

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push to GitHub

```bash
git init
git add .
git commit -m "Asset classification app with Django API"
git branch -M main
git remote add origin https://github.com/yourusername/asset-classification.git
git push -u origin main
```

### 2.2 Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:

**Framework Preset:** Next.js
**Root Directory:** `./` (leave empty)
**Build Command:** `npm run build`
**Output Directory:** `.next`

### 2.3 Set Environment Variables

Add the environment variables from Step 1.2 in your Vercel project settings.

### 2.4 Deploy

Click "Deploy" - Vercel will build both frontend and backend automatically!

## 🧪 Step 3: Test Your Deployment

### 3.1 Frontend Tests
- **Homepage:** `https://your-app-name.vercel.app`
- **Dashboard:** `https://your-app-name.vercel.app/` (should load with API data)
- **Asset Management:** `https://your-app-name.vercel.app/classification/assets`

### 3.2 API Tests
- **API Root:** `https://your-app-name.vercel.app/api/`
- **Assets Endpoint:** `https://your-app-name.vercel.app/api/assets/`
- **API Documentation:** `https://your-app-name.vercel.app/api/schema/docs/`

### 3.3 Five-Phase Framework Tests
1. **Create Asset:** Use asset form at `/classification/asset-form`
2. **Classify Asset:** POST to `/api/assets/{id}/classify_asset/`
3. **Risk Identification:** POST to `/api/assets/{id}/identify_risk/`
4. **Risk Analysis:** POST to `/api/assets/{id}/analyze_risk/`
5. **Model Comparison:** POST to `/api/assets/{id}/compare_models/`

## 📊 Step 4: Seed Initial Data

### 4.1 Via Django Admin (Recommended)
1. Go to `https://your-app-name.vercel.app/api/admin/`
2. Login with superuser credentials (created during deployment)
3. Add departments, asset types, and asset values

### 4.2 Via API Endpoints
Use the frontend forms or API endpoints to create initial data:
```bash
# Create department
POST /api/departments/
{
  "name": "IT Department",
  "description": "Information Technology"
}

# Create asset type
POST /api/asset-types/
{
  "name": "Database",
  "description": "Database servers and systems"
}
```

## 🛠️ Local Development

### 4.1 Start Backend (Required)
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 4.2 Start Frontend
```bash
# In project root
npm install
npm run dev
```

Frontend will connect to local Django API at `http://localhost:8000/api`

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. "Failed to fetch" errors
**Cause:** API not accessible or CORS issues
**Solution:** 
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify Django API is running
- Check CORS settings in `deployment_settings.py`

#### 2. "404 Not Found" on API routes
**Cause:** Vercel routing issues
**Solution:** Verify `vercel.json` configuration and API paths

#### 3. Empty data on frontend
**Cause:** No data in database
**Solution:** 
- Use Django admin to add initial data
- Check API endpoints return data: `/api/assets/`, `/api/departments/`

#### 4. Build failures
**Cause:** Missing dependencies or environment variables
**Solution:** 
- Check all environment variables are set in Vercel
- Verify `requirements.txt` includes all dependencies

#### 5. Database errors
**Cause:** Database configuration issues
**Solution:**
```bash
# For SQLite (default)
DATABASE_URL=sqlite:///db.sqlite3

# For PostgreSQL
DATABASE_URL=postgres://user:password@host:port/database
```

## 📊 Available API Endpoints

### Core Asset Management
```bash
GET    /api/assets/                     # List all assets
POST   /api/assets/                     # Create new asset  
GET    /api/assets/{id}/                # Get specific asset
PUT    /api/assets/{id}/                # Update asset
DELETE /api/assets/{id}/                # Delete asset
```

### Five-Phase Classification Framework
```bash
POST   /api/assets/{id}/classify_asset/     # Phase 1: Fuzzy logic classification
POST   /api/assets/{id}/identify_risk/      # Phase 2: CIA risk identification
POST   /api/assets/{id}/analyze_risk/       # Phase 3: Mathematical risk analysis  
POST   /api/assets/{id}/compare_models/     # Phase 4: Model performance comparison
# Phase 5: Risk handling available through frontend interface
```

### Supporting Data
```bash
GET    /api/departments/                # List departments
GET    /api/asset-types/               # List asset types
GET    /api/asset-value-mappings/      # List asset value mappings
GET    /api/assessment-questions/      # List assessment questions
```

### Analytics & Performance
```bash
GET    /api/assets/performance_metrics/     # Performance metrics
POST   /api/assets/batch_compare/           # Batch model comparison
GET    /api/classification-reports/         # Classification reports
GET    /api/confusion-matrices/             # Confusion matrices
```

## 🎯 Development Workflow

### 1. Local Development
```bash
# Terminal 1: Start Django API
cd api && python manage.py runserver

# Terminal 2: Start Next.js frontend  
npm run dev
```

### 2. Add New Features
```bash
# Add API endpoints in Django
# Update frontend hooks in src/lib/hooks/
# Test locally then deploy
```

### 3. Deploy Changes
```bash
git add .
git commit -m "Add new feature"
git push origin main
# Vercel auto-deploys
```

## 🔐 Security & Production

### Environment Variables Security
- ✅ All secrets in Vercel environment variables
- ✅ No sensitive data in code
- ✅ Strong SECRET_KEY (50+ characters)
- ✅ DEBUG=False in production

### API Security
- ✅ CORS properly configured
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Security headers enabled
- ✅ Database credentials secure

## 📈 Performance Features

- ✅ React Query caching for API calls
- ✅ Next.js automatic optimization
- ✅ Django REST framework pagination
- ✅ WhiteNoise static file compression
- ✅ Vercel edge caching

## 🎉 Success Indicators

Your deployment is working when:

### ✅ Frontend
- Dashboard displays real data from API
- Asset forms create/update data successfully  
- Navigation between all pages works
- Charts and analytics show real metrics

### ✅ Backend
- API documentation accessible
- All CRUD operations functional
- Five-phase workflow operational
- Admin panel accessible

### ✅ Integration
- Frontend-backend communication seamless
- Real-time data updates working
- Error handling functional
- Performance metrics displaying

## 🌟 Your Live Application

After successful deployment:

- **🏠 App:** `https://your-app-name.vercel.app`
- **📊 Dashboard:** `https://your-app-name.vercel.app/dashboard`
- **🔧 API:** `https://your-app-name.vercel.app/api/`
- **📚 Docs:** `https://your-app-name.vercel.app/api/schema/docs/`
- **⚙️ Admin:** `https://your-app-name.vercel.app/api/admin/`

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- Check Vercel function logs for debugging

---

**🎯 You now have a production-ready Asset Classification application with real Django backend integration deployed on Vercel!**