# Todo Chatbot Cloud-Native Deployment Constitution

## Core Principles

### I. Cloud-Native First
Every component must be designed for containerized deployment on Kubernetes. Applications must be stateless where possible, use environment variables for configuration, and follow the 12-factor app methodology. No hardcoded hostnames, ports, or credentials in application code.

### II. Spec-Driven Development (SDD)
All development follows the SDD workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding without specification. Every change must trace back to a requirement in the spec. Infrastructure-as-Code is treated with the same rigor as application code.

### III. Container Best Practices
Docker images must use multi-stage builds where applicable, run as non-root users, minimize layer count, and use Alpine-based images for smallest footprint. Each service (frontend, backend, database) has its own Dockerfile. Images must be buildable and testable locally.

### IV. Kubernetes-Ready Architecture
All services must be deployable via Helm charts on Minikube. Services must define health checks (liveness and readiness probes), resource limits, and proper labels/selectors. Use namespaces for isolation. Prefer ClusterIP for internal services and NodePort for external access.

### V. AI-Assisted Operations (AIOps)
Leverage AI DevOps tools (Docker AI Gordon, kubectl-ai, kagent) for intelligent container and Kubernetes operations where available. Document AI-assisted commands alongside manual fallbacks. AI tools augment but do not replace understanding of the underlying systems.

### VI. Simplicity and Pragmatism
Start with the simplest working solution. Use basic-level functionality — keyword-matching chatbot, in-memory or simple DB persistence. No over-engineering. YAGNI (You Aren't Gonna Need It) applies. Every added component must justify its existence.

## Technology Standards

- **Runtime**: Node.js 18 (Alpine)
- **Frontend**: Static HTML/CSS/JS served via Nginx
- **Backend**: Express.js REST API
- **Database**: PostgreSQL 14 (Alpine)
- **Cache**: Redis 7 (Alpine)
- **Container Runtime**: Docker (Docker Desktop)
- **Orchestration**: Kubernetes via Minikube
- **Package Manager**: Helm 3
- **AI DevOps**: kubectl-ai, kagent, Docker AI (Gordon)

## Development Workflow

1. **Specify**: Define feature requirements in `spec.md`
2. **Plan**: Create architectural plan in `plan.md`
3. **Tasks**: Break plan into testable tasks in `tasks.md`
4. **Implement**: Execute tasks via Claude Code — no manual coding
5. **Validate**: Test each component independently before integration
6. **Deploy**: Containerize → Local Docker test → Helm deploy to Minikube

## Governance

- Constitution supersedes all other practices and decisions
- All changes must be small, testable, and traceable to a spec requirement
- Secrets must use environment variables, never hardcoded
- Every deployment must have a rollback strategy
- PHR (Prompt History Record) created for every significant interaction

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
