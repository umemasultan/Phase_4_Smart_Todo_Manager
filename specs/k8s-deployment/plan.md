# Architecture Plan: Local Kubernetes Deployment

**Feature**: k8s-deployment  
**Created**: 2026-04-04  
**Status**: Approved  
**Spec Reference**: `specs/k8s-deployment/spec.md`

## 1. Scope and Dependencies

### In Scope
- Create real backend application code (Express.js server with PostgreSQL + Redis)
- Fix frontend Dockerfile (static HTML served by Nginx, no React build needed)
- Fix backend Dockerfile (proper Node.js app packaging)
- Create docker-compose.yml for local testing
- Fix and validate Helm charts for Minikube deployment
- Create step-by-step deployment guide with AI tool commands

### Out of Scope
- Production-grade deployment (TLS, Ingress controllers, external DNS)
- Persistent volumes for database (data lost on pod restart is acceptable)
- CI/CD pipeline setup
- Monitoring stack (Prometheus, Grafana)
- Real AI/LLM integration in chatbot (keyword-matching is sufficient)

### External Dependencies
- Docker Desktop (installed on developer machine)
- Minikube (binary already present at project root)
- Helm 3 (binary already present at project root)
- kubectl (comes with Docker Desktop)
- kubectl-ai, kagent (optional — manual fallback documented)

## 2. Key Decisions and Rationale

### Decision 1: Frontend as Static HTML + Nginx (not React)
- **Options**: Build React app vs Serve static HTML
- **Chosen**: Static HTML served by Nginx
- **Rationale**: The existing frontend is a single `index.html` file with inline CSS/JS. There's no React source code, no `package.json` in `frontend/`. Building a React app would be scope creep. The Dockerfile needs to simply copy `index.html` + `nginx.conf` into an Nginx container.

### Decision 2: Backend as Express.js with Real DB Connection
- **Options**: Keep mock server vs Build real backend
- **Chosen**: Build real Express.js backend with PostgreSQL connection
- **Rationale**: The mock `simple-dev-server.js` has hardcoded responses. A real backend with DB connectivity is needed to demonstrate proper K8s service-to-service communication (backend → database). The chat functionality remains keyword-based but reads/writes todos from PostgreSQL.

### Decision 3: Use Simple Helm Chart (todo-chatbot) Not Governed
- **Options**: Use `todo-chatbot/` chart vs `todo-chatbot-governed/` chart
- **Chosen**: Fix and use `todo-chatbot/` chart as primary, keep governed as reference
- **Rationale**: The basic chart is simpler and sufficient for Phase IV requirements. The governed chart has additional complexity (governance annotations, AI policies) that may confuse validation. We'll fix the basic chart first, then ensure the governed chart also works.

### Decision 4: Health Check on `/api/health` (not `/health`)
- **Options**: `/health` vs `/api/health`
- **Chosen**: `/api/health`
- **Rationale**: The existing dev server already uses `/api/health`. Nginx config proxies `/api/*` to backend. Helm chart liveness/readiness probes should use `/api/health` to match the actual endpoint path.

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Minikube Cluster                       │
│                   Namespace: todo-app                     │
│                                                          │
│  ┌──────────────┐     ┌──────────────┐   ┌───────────┐  │
│  │  Frontend     │     │  Backend     │   │  Database  │  │
│  │  (Nginx)     │────►│  (Express)   │──►│ (Postgres) │  │
│  │  Port:80     │     │  Port:8080   │   │ Port:5432  │  │
│  │  NodePort:   │     │  ClusterIP   │   │ ClusterIP  │  │
│  │  30080       │     │              │   │            │  │
│  └──────────────┘     └──────────────┘   └───────────┘  │
│                              │                           │
│                              ▼                           │
│                       ┌───────────┐                      │
│                       │  Redis    │                      │
│                       │  Port:6379│                      │
│                       │ ClusterIP │                      │
│                       └───────────┘                      │
└─────────────────────────────────────────────────────────┘
         │
         ▼ NodePort 30080
   ┌──────────┐
   │ Browser  │
   └──────────┘
```

## 4. Component Details

### 4.1 Frontend (Nginx)
- **Image**: `nginx:alpine`
- **Build**: Copy `index.html`, `favicon.ico` → `/usr/share/nginx/html/`
- **Config**: `nginx.conf` proxies `/api/*` → `todo-backend:8080`
- **Health**: HTTP GET `/` returns 200
- **Dockerfile**: Simple COPY, no build stage needed

### 4.2 Backend (Express.js)
- **Image**: `node:18-alpine`
- **Files needed**: `server.js`, `package.json` in `backend/`
- **Endpoints**:
  - `GET /api/health` → `{ status: 'healthy', timestamp, db: 'connected'/'disconnected' }`
  - `GET /api/todos` → List todos from PostgreSQL
  - `POST /api/todos` → Create todo in PostgreSQL
  - `POST /api/chat` → Keyword-matching chatbot (reads real todos from DB)
  - `PUT /api/todos/:id` → Update todo
  - `DELETE /api/todos/:id` → Delete todo
- **ENV vars**: `DATABASE_URL`, `REDIS_URL`, `NODE_ENV`, `PORT`
- **Health**: Liveness at `/api/health` (initial delay: 15s, period: 10s)

### 4.3 Database (PostgreSQL 14)
- **Image**: `postgres:14-alpine`
- **Init**: `init.sql` creates tables and seed data
- **ENV**: `POSTGRES_DB=todo_app`, `POSTGRES_USER=todo_user`, `POSTGRES_PASSWORD=password123`
- **No changes needed**: Dockerfile and init.sql are working

### 4.4 Cache (Redis 7)
- **Image**: `redis:7-alpine` (direct from Docker Hub)
- **No custom Dockerfile needed**
- **Used by**: Backend for optional caching (graceful degradation if unavailable)

## 5. File Changes Required

| File | Action | Description |
|------|--------|-------------|
| `backend/server.js` | **CREATE** | Real Express.js backend with DB connectivity |
| `backend/package.json` | **CREATE** | Dependencies: express, pg, redis, cors |
| `frontend/Dockerfile` | **REWRITE** | Simple Nginx copy (no build stage) |
| `backend/Dockerfile` | **FIX** | Remove nextjs user references, use correct paths |
| `docker-compose.yml` | **CREATE** | Multi-service local testing |
| `todo-chatbot/values.yaml` | **FIX** | Fix health check paths |
| `todo-chatbot/templates/backend-deployment.yaml` | **FIX** | Fix probe paths |
| `deploy-to-minikube.sh` | **CREATE** | Automated deployment script |
| `deploy-to-minikube.ps1` | **CREATE** | Windows deployment script |

## 6. Deployment Strategy

### Local Testing (Docker Compose)
1. `docker-compose build` → Build all images
2. `docker-compose up` → Run all services
3. Access `http://localhost:3000` → Test frontend
4. `curl http://localhost:8080/api/health` → Test backend

### Minikube Deployment
1. Start Minikube: `minikube start --driver=docker --cpus=2 --memory=4096`
2. Set Docker env: `eval $(minikube docker-env)` (Linux/Mac) or `minikube docker-env | Invoke-Expression` (Windows)
3. Build images inside Minikube: `docker build -t todo-frontend ./frontend` etc.
4. Deploy via Helm: `helm install todo-chatbot ./todo-chatbot`
5. Access: `minikube service todo-frontend -n todo-app`

## 7. Risk Analysis

| Risk | Mitigation |
|------|-----------|
| Minikube resources too low | Use 1 replica per service, reduce memory limits |
| Backend can't reach DB on startup | readinessProbe with initialDelaySeconds gives DB time to start |
| Frontend Nginx can't resolve backend hostname | Kubernetes DNS handles service discovery within namespace |
| kubectl-ai/kagent not available | Manual kubectl commands documented as fallback |

## 8. Validation Checklist

- [ ] `docker build` succeeds for all 3 services
- [ ] `docker-compose up` runs all services and frontend loads
- [ ] Chat messages get responses through the UI
- [ ] `helm template` renders valid Kubernetes YAML
- [ ] Pods reach Running state on Minikube
- [ ] Frontend accessible via NodePort on Minikube
- [ ] Health endpoints return 200 OK
