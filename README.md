# Cloud Asset Classification System

A comprehensive system for cloud asset risk classification using traditional fuzzy logic and modern machine learning approaches (SVM, Decision Tree) for academic thesis research.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with Material-UI
- **Backend**: Django REST Framework API  
- **Database**: PostgreSQL
- **ML Models**: Fuzzy Logic, SVM, Decision Tree
- **Documentation**: Auto-generated OpenAPI/Swagger

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 14+

### 1. Setup Backend
```bash
cd api
pip install -r requirements.txt
cp .env.example .env  # Configure your database
python manage.py migrate
python trainModel.py  # Train ML models
python manage.py runserver
```

### 2. Setup Frontend
```bash
npm install
cp .env.local.example .env.local  # Configure API URL
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/api/schema/swagger-ui/
- **Admin**: http://localhost:8000/admin/

## 📊 4-Phase Classification Workflow

1. **Phase 1**: Asset Classification (Fuzzy Logic)
2. **Phase 2**: Risk Identification (CIA Triad)
3. **Phase 3**: Mathematical Risk Analysis (Risk = Probability × Harm)
4. **Phase 4**: Model Comparison (Fuzzy vs SVM vs Decision Tree)

## 🔗 API Endpoints

### Core Operations
```
GET/POST   /api/assets/                    # Asset CRUD
POST       /api/assets/{id}/classify_asset/    # Phase 1
POST       /api/assets/{id}/identify_risk/     # Phase 2  
POST       /api/assets/{id}/analyze_risk/      # Phase 3
POST       /api/assets/{id}/compare_models/    # Phase 4
```

### Batch & Analytics
```
POST       /api/assets/batch_compare/          # Batch processing
GET        /api/assets/performance_metrics/    # Performance data
```

## 🧪 Model Comparison

The system compares three approaches on identical tasks:

- **Traditional**: Fuzzy Logic (Rule-based, Interpretable)
- **Modern 1**: Support Vector Machine (High Accuracy)
- **Modern 2**: Decision Tree (Fast, Interpretable)

## 📁 Project Structure

```
├── api/                          # Django REST API
│   ├── assets_management/
│   │   ├── models.py            # Database models
│   │   ├── serializers.py       # DRF serializers
│   │   ├── views.py             # REST API views
│   │   ├── rest_urls.py         # API routing
│   │   └── utils/               # Business logic
│   │       ├── fuzzy_direct_classifier.py
│   │       ├── risk_analysis.py
│   │       └── model_comparison.py
│   └── requirements.txt
├── src/                         # Next.js Frontend
│   └── app/
│       └── (DashboardLayout)/
├── restClient.ts                # REST API client
├── package.json
└── README.md
```

## 🔧 Environment Variables

### Backend (`api/.env`)
```env
SECRET_KEY=your-django-secret
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📈 Usage Example

```typescript
import { assetAPI } from './restClient';

// Run complete 4-phase workflow
const runWorkflow = async (assetId: string) => {
  await assetAPI.classifyAsset(assetId);           // Phase 1
  await assetAPI.identifyRisk(assetId, ciaData);   // Phase 2
  await assetAPI.analyzeRisk(assetId);             // Phase 3
  await assetAPI.compareModels(assetId);           // Phase 4
};
```

## 📚 Documentation

- **API Documentation**: Available at `/api/schema/swagger-ui/`
- **Setup Guide**: See `SETUP_INSTRUCTIONS.md`
- **Development Plan**: See `DEVELOPMENT_PLAN.md`

## 🎯 Research Focus

This system enables fair comparison between traditional and modern approaches for cloud asset risk classification, supporting academic research into the effectiveness of different machine learning methodologies.

## 📄 License

Academic research project - See LICENSE file for details.
