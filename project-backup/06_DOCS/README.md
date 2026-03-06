# REALFORGE AI – MVP Architecture

**One-click real estate engine** – written for production, created for agents, tuned for mom.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Python 3.11+ (for ML service)
- Docker & Docker Compose (optional)

### Installation

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd REALFORGE-AI
cp .env.example .env.local
# Edit .env.local with your configuration
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up database:**
```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres redis

# Or manually:
# 1. Install PostgreSQL and Redis
# 2. Create database: createdb realforge_ai
# 3. Update DATABASE_URL in .env.local
```

4. **Run database migrations:**
```bash
npx prisma db push
```

5. **Start development servers:**
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: ML Service
cd ml-service
pip install -r requirements.txt
python app.py

# Terminal 3: Worker (optional)
npm run worker
```

Or using Docker Compose:
```bash
docker-compose up
```

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma, PostgreSQL
- **AI/ML:** Python FastAPI microservice (CLIP, DINOv2, GPT-4o-mini)
- **Storage:** Vercel Blob + Cloudflare R2
- **Queue:** BullMQ + Redis (Upstash)
- **Auth:** NextAuth.js (Credentials + Magic Link)
- **Monitoring:** Sentry + Vercel Analytics

### Data Models
The system includes 7 main models:
1. **Agent** – Real estate agents
2. **Office** – Real estate offices with branding
3. **Listing** – Property listings (main entity)
4. **ListingMedia** – Photos/videos with AI metadata
5. **AIResult** – AI-generated content per listing
6. **CRMLead** – Customer relationship management
7. **ExportJob** – Platform export jobs (Sreality, Bezrealitky, etc.)

## 📁 Project Structure

```
REALFORGE-AI/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   └── auth/          # NextAuth.js routes
│   ├── (auth)/            # Authentication pages
│   ├── listings/          # Listing management
│   ├── crm/               # CRM dashboard
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navbar.tsx        # Navigation
│   └── theme-provider.tsx # Dark/light theme
├── lib/                   # Utilities and shared code
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema (7 models)
├── ml-service/           # Python AI microservice
│   ├── app.py            # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Container configuration
├── public/               # Static assets
└── docker-compose.yml    # Development environment
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/realforge_ai"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# ML Service
ML_SERVICE_URL="http://localhost:8000"

# File Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Redis (for queues)
REDIS_URL="redis://localhost:6379"
```

### Prisma Setup
1. Generate Prisma client: `npx prisma generate`
2. Push schema to database: `npx prisma db push`
3. Open Prisma Studio: `npx prisma studio`

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker Production
```bash
# Build and run
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

### Manual Deployment
1. **Build Next.js app:**
```bash
npm run build
npm start
```

2. **Deploy ML service:**
```bash
cd ml-service
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app
```

## 🤖 AI Pipeline

### Hybrid AI Architecture
- **Image Analysis:** CLIP + DINOv2 for classification and segmentation
- **Text Generation:** Rule-based templates + GPT-4o-mini for creativity
- **Cost Optimization:** ~$0.002 per listing (vs $0.15 for full GPT-4)

### ML Service Endpoints
- `POST /api/v1/analyze-image` – Analyze property images
- `POST /api/v1/generate-texts` – Generate marketing content
- `POST /api/v1/process-listing` – Complete listing pipeline

## 📊 Monitoring & Analytics

- **Error Tracking:** Sentry integration
- **Performance:** Vercel Analytics
- **Queue Monitoring:** BullMQ dashboard
- **Database:** Prisma Studio + PostgreSQL monitoring

## 🔄 Background Jobs

The system uses BullMQ for:
- Image processing queue
- AI content generation
- Platform exports (Sreality, Bezrealitky, etc.)
- CRM notifications

Start worker:
```bash
npm run worker
```

## 📈 Roadmap

### MVP (Current)
- [x] Basic listing management
- [x] Image upload and AI analysis
- [x] Marketing text generation
- [x] Agent authentication
- [x] CRM lead tracking

### Phase 2
- [ ] Platform exports (Sreality, Bezrealitky)
- [ ] Advanced AI recommendations
- [ ] Mobile app (React Native)
- [ ] Payment integration

### Phase 3
- [ ] Virtual tours integration
- [ ] Market analytics dashboard
- [ ] Automated valuation model (AVM)
- [ ] API for third-party integrations

## 🆘 Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check PostgreSQL is running: `pg_isready`
   - Verify DATABASE_URL in .env.local
   - Run: `npx prisma db push`

2. **ML service not starting:**
   - Check Python version: `python --version`
   - Install dependencies: `pip install -r requirements.txt`
   - Check port 8000 is available

3. **Authentication errors:**
   - Verify NEXTAUTH_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Clear browser cookies

### Development Commands

```bash
# Database
npx prisma db push      # Update database schema
npx prisma studio       # Open database GUI
npx prisma generate     # Generate Prisma client

# Development
npm run dev            # Start Next.js dev server
npm run worker         # Start background worker
npm run build         # Build for production
npm start             # Start production server

# Testing
npm run test          # Run tests
npm run lint          # Lint code
```

## 📄 License

Proprietary – All rights reserved.

## 👥 Team

Built with ❤️ for real estate agents who deserve better tools.

---

**REALFORGE AI** – Making real estate smarter, one click at a time.