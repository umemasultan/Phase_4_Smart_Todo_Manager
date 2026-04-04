# Tasks: Local Kubernetes Deployment

**Feature**: k8s-deployment  
**Created**: 2026-04-04  
**Plan Reference**: `specs/k8s-deployment/plan.md`  
**Spec Reference**: `specs/k8s-deployment/spec.md`

---

## Task 1: Create Backend Application Code
**Status**: Pending  
**Priority**: P1  
**Depends on**: None  
**Files**: `backend/server.js`, `backend/package.json`

### Description
Create a real Express.js backend server that connects to PostgreSQL and Redis. The server must handle todo CRUD operations and keyword-matching chat functionality by reading real data from the database.

### Acceptance Criteria
- [ ] `backend/package.json` exists with express, pg, redis, cors dependencies
- [ ] `backend/server.js` implements: GET /api/health, GET /api/todos, POST /api/todos, POST /api/chat, PUT /api/todos/:id, DELETE /api/todos/:id
- [ ] Health endpoint reports DB connection status
- [ ] Chat endpoint reads real todos from database for "list/show" commands
- [ ] Server starts on PORT env var (default 8080)
- [ ] Graceful degradation when Redis/DB are unavailable

### Test Cases
1. `npm start` in backend/ → server starts on port 8080
2. `curl localhost:8080/api/health` → returns `{ status: 'healthy' }`
3. `curl localhost:8080/api/todos` → returns array of todos
4. `curl -X POST localhost:8080/api/chat -H 'Content-Type: application/json' -d '{"message":"hello"}' ` → returns greeting response

---

## Task 2: Fix Frontend Dockerfile
**Status**: Pending  
**Priority**: P1  
**Depends on**: None  
**Files**: `frontend/Dockerfile`

### Description
Rewrite the frontend Dockerfile to simply copy static HTML files into an Nginx container. Remove the non-existent React build stage.

### Acceptance Criteria
- [ ] Dockerfile uses `nginx:alpine` as base (single stage, no build stage)
- [ ] Copies `index.html`, `favicon.ico` to `/usr/share/nginx/html/`
- [ ] Copies `nginx.conf` to `/etc/nginx/nginx.conf`
- [ ] `docker build -t todo-frontend ./frontend` succeeds
- [ ] `docker run -p 3000:80 todo-frontend` serves the UI

### Test Cases
1. `docker build -t todo-frontend ./frontend` → builds without error
2. `docker run -p 3000:80 todo-frontend` → http://localhost:3000 shows chatbot UI

---

## Task 3: Fix Backend Dockerfile
**Status**: Pending  
**Priority**: P1  
**Depends on**: Task 1  
**Files**: `backend/Dockerfile`

### Description
Fix the backend Dockerfile to properly package the Express.js application. Remove incorrect user references (nextjs) and ensure proper startup.

### Acceptance Criteria
- [ ] Uses `node:18-alpine` as base
- [ ] Copies `package.json`, `package-lock.json`, runs `npm ci --only=production`
- [ ] Copies `server.js` and source code
- [ ] Runs as non-root user (node)
- [ ] Exposes port 8080
- [ ] `docker build -t todo-backend ./backend` succeeds

### Test Cases
1. `docker build -t todo-backend ./backend` → builds without error
2. `docker run -p 8080:8080 -e DATABASE_URL=... todo-backend` → server starts

---

## Task 4: Create Docker Compose
**Status**: Pending  
**Priority**: P1  
**Depends on**: Task 1, Task 2, Task 3  
**Files**: `docker-compose.yml`

### Description
Create a docker-compose.yml that orchestrates all four services (frontend, backend, database, redis) for local testing.

### Acceptance Criteria
- [ ] Defines 4 services: frontend, backend, database, redis
- [ ] Frontend maps port 3000:80
- [ ] Backend maps port 8080:8080 with DATABASE_URL and REDIS_URL env vars
- [ ] Database uses init.sql for initialization
- [ ] Services have proper `depends_on` ordering
- [ ] `docker-compose up --build` starts all services successfully

### Test Cases
1. `docker-compose up --build` → all 4 services start
2. http://localhost:3000 → chatbot UI loads
3. Chat message sent → response received through API

---

## Task 5: Fix Helm Chart Values and Templates
**Status**: Pending  
**Priority**: P1  
**Depends on**: Task 2, Task 3  
**Files**: `todo-chatbot/values.yaml`, `todo-chatbot/templates/backend-deployment.yaml`

### Description
Fix the Helm chart to use correct health check paths (`/api/health` instead of `/health`) and ensure image references match buildable images.

### Acceptance Criteria
- [ ] Backend liveness/readiness probes use path `/api/health`
- [ ] Image pull policy is `Never` (for local Minikube images)
- [ ] `helm template todo-chatbot ./todo-chatbot` renders valid YAML
- [ ] All services have correct port mappings
- [ ] Namespace `todo-app` is created by the chart

### Test Cases
1. `helm template todo-chatbot ./todo-chatbot` → valid YAML output, no errors
2. `helm lint ./todo-chatbot` → passes lint check

---

## Task 6: Create Minikube Deployment Scripts
**Status**: Pending  
**Priority**: P2  
**Depends on**: Task 4, Task 5  
**Files**: `deploy-to-minikube.ps1`, `deploy-to-minikube.sh`

### Description
Create deployment scripts (PowerShell for Windows, Bash for Linux/Mac) that automate the full Minikube deployment process.

### Acceptance Criteria
- [ ] Script starts Minikube if not running
- [ ] Configures Docker env for Minikube
- [ ] Builds all Docker images inside Minikube's Docker daemon
- [ ] Deploys via Helm to `todo-app` namespace
- [ ] Waits for pods to be ready
- [ ] Opens the frontend URL
- [ ] Includes cleanup/uninstall option

### Test Cases
1. Run `./deploy-to-minikube.ps1` → full deployment completes
2. All pods in Running state
3. Frontend accessible via `minikube service`

---

## Task 7: Document AI Operations Commands
**Status**: Pending  
**Priority**: P2  
**Depends on**: Task 6  
**Files**: `AI-OPERATIONS-GUIDE.md`

### Description
Create comprehensive documentation of kubectl-ai and kagent commands for AI-assisted Kubernetes operations, with manual fallback commands.

### Acceptance Criteria
- [ ] Documents kubectl-ai commands for deployment, scaling, troubleshooting
- [ ] Documents kagent commands for cluster health analysis
- [ ] Documents Docker AI (Gordon) commands with availability note
- [ ] Each AI command has a manual kubectl fallback
- [ ] Step-by-step getting started guide included

### Test Cases
1. Document is readable and well-structured
2. Manual fallback commands are correct and tested

---

## Summary

| Task | Priority | Dependencies | Status |
|------|----------|-------------|--------|
| 1. Backend Application Code | P1 | None | Pending |
| 2. Fix Frontend Dockerfile | P1 | None | Pending |
| 3. Fix Backend Dockerfile | P1 | Task 1 | Pending |
| 4. Docker Compose | P1 | Task 1,2,3 | Pending |
| 5. Fix Helm Charts | P1 | Task 2,3 | Pending |
| 6. Deployment Scripts | P2 | Task 4,5 | Pending |
| 7. AI Operations Guide | P2 | Task 6 | Pending |
