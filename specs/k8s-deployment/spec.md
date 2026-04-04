# Feature Specification: Local Kubernetes Deployment

**Feature Branch**: `phase-4-k8s-deployment`  
**Created**: 2026-04-04  
**Status**: Approved  
**Input**: Phase IV hackathon requirements — Deploy Todo Chatbot on local Kubernetes cluster using Minikube, Helm Charts, with AI-assisted operations.

## User Scenarios & Testing

### User Story 1 - Build and Run Containers Locally (Priority: P1)

As a developer, I want to containerize the frontend, backend, and database services so that each service runs independently in its own Docker container.

**Why this priority**: Without working Docker containers, nothing else (Helm, K8s) can proceed. This is the foundation.

**Independent Test**: Run `docker build` for each service and `docker run` each container individually. Frontend serves HTML on port 80, Backend responds to `/api/health` on port 8080, Database accepts connections on port 5432.

**Acceptance Scenarios**:

1. **Given** the backend source code exists in `backend/`, **When** I run `docker build -t todo-backend ./backend`, **Then** the image builds successfully without errors
2. **Given** the frontend source code exists in `frontend/`, **When** I run `docker build -t todo-frontend ./frontend`, **Then** the image builds with Nginx serving the static HTML
3. **Given** the database Dockerfile and init.sql exist in `database/`, **When** I run `docker build -t todo-database ./database`, **Then** PostgreSQL starts with the todo_app schema initialized
4. **Given** all three images are built, **When** I run them together via `docker-compose up`, **Then** the frontend proxies API requests to the backend which connects to the database

---

### User Story 2 - Deploy on Minikube via Helm Charts (Priority: P1)

As a developer, I want to deploy all services to a local Minikube Kubernetes cluster using Helm charts so that the application runs in a production-like environment.

**Why this priority**: This is the core Phase IV requirement — K8s deployment.

**Independent Test**: Run `helm install todo-chatbot ./todo-chatbot` on Minikube and verify all pods are running and the frontend is accessible via NodePort.

**Acceptance Scenarios**:

1. **Given** Minikube is running with Docker driver, **When** I load Docker images into Minikube and run `helm install`, **Then** all pods (frontend, backend, database, redis) reach Running state
2. **Given** the Helm chart is deployed, **When** I access `minikube service todo-frontend -n todo-app`, **Then** the Todo Chatbot UI loads in the browser
3. **Given** the frontend is accessible, **When** I send a chat message, **Then** it reaches the backend via Nginx proxy and returns a response

---

### User Story 3 - AI-Assisted DevOps Operations (Priority: P2)

As a developer, I want to use kubectl-ai and kagent commands for intelligent Kubernetes operations like scaling, troubleshooting, and cluster analysis.

**Why this priority**: Enhances the deployment experience but the app works without it.

**Independent Test**: Run `kubectl-ai "check pod status in todo-app namespace"` and verify it returns meaningful output.

**Acceptance Scenarios**:

1. **Given** the app is deployed on Minikube, **When** I run kubectl-ai commands like `kubectl-ai "deploy the todo frontend with 2 replicas"`, **Then** the command executes successfully or provides clear guidance
2. **Given** a pod is failing, **When** I run `kubectl-ai "check why the pods are failing"`, **Then** it provides diagnostic information

---

### User Story 4 - Docker AI Agent (Gordon) for Build Optimization (Priority: P3)

As a developer, I want to use Docker AI Agent (Gordon) for AI-assisted Docker operations like image optimization and security scanning.

**Why this priority**: Nice-to-have for AI-assisted Docker operations. Manual Docker CLI is the fallback.

**Independent Test**: Run `docker ai "analyze my Dockerfile for best practices"` and verify it provides suggestions.

**Acceptance Scenarios**:

1. **Given** Docker Desktop 4.53+ with Gordon enabled, **When** I run `docker ai "What can you do?"`, **Then** it responds with its capabilities
2. **Given** Gordon is unavailable, **When** I use standard Docker CLI commands, **Then** all containerization still works correctly

---

### Edge Cases

- What happens when Minikube runs out of memory? → Reduce replica counts to 1 each
- What happens when a database pod restarts? → Data is lost (no persistent volume in basic setup)
- What happens when backend cannot connect to database? → Health check fails, pod restarts via liveness probe
- What happens when Docker images are too large? → Use Alpine base images and multi-stage builds

## Requirements

### Functional Requirements

- **FR-001**: System MUST have a working backend Express.js server with `/api/health`, `/api/todos`, and `/api/chat` endpoints
- **FR-002**: System MUST have a frontend that serves the Todo Chatbot UI via Nginx and proxies API requests to the backend
- **FR-003**: System MUST have a PostgreSQL database initialized with the todo schema (users, todos, chat_sessions tables)
- **FR-004**: System MUST have working Dockerfiles for all three services (frontend, backend, database) that build successfully
- **FR-005**: System MUST have a docker-compose.yml for local multi-container testing
- **FR-006**: System MUST have a Helm chart that deploys all services (frontend, backend, database, redis) to Minikube
- **FR-007**: Frontend MUST be accessible via NodePort (30080) on Minikube
- **FR-008**: Backend MUST have liveness and readiness probes at `/api/health`
- **FR-009**: System MUST include deployment scripts with step-by-step instructions for Minikube setup
- **FR-010**: System SHOULD document kubectl-ai and kagent commands for AI-assisted operations

### Key Entities

- **Todo**: id, user_id, title, description, completed, created_at, updated_at
- **User**: id, username, email, created_at
- **ChatSession**: id, user_id, session_token, created_at, expires_at

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 3 Dockerfiles build successfully with `docker build` (zero build errors)
- **SC-002**: `docker-compose up` starts all services and frontend is accessible at localhost:3000
- **SC-003**: `helm install` deploys all pods to Minikube and they reach Running state within 120 seconds
- **SC-004**: Chat API responds to messages when accessed through the frontend UI
- **SC-005**: Health check endpoint returns 200 OK on `/api/health`
- **SC-006**: Deployment guide is clear enough for a new developer to deploy in under 15 minutes
