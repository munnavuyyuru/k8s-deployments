# Decision Document — 3-Tier App Deployment on EKS

## Architecture

```
  Internet
     |
  [Ingress-NGINX]  (exposed via LoadBalancer)
     |
  [Frontend Service]  (quotes-frontend-service:5002)
     |  namespace: frontend
     |
  [Frontend Pods]  ---calls--->  http://api.backend.svc.cluster.local:5001
     |
  [API Service]  (api:5001)
     |  namespace: backend
     |
  [API Pods]  ---MySQL--->  mysql.database.svc.cluster.local:3306
     |
  [MySQL Service]  (mysql:3306)
     |  namespace: database
     |
  [MySQL StatefulSet]  (1 replica, 10Gi PVC)

```

## Decisions

### 1. Keep Application Code Unchanged
- `app/`, `api/`, `db/` directories (Python + Dockerfiles + SQL) are left exactly as-is.
- No logic or framework changes.

### 2. Container Registry → AWS ECR
- All 3 images (`quotes-db`, `quotes-api`, `quotes-frontend`) will be pushed to **Amazon ECR**.
- ECR repos will be created per image under a single AWS account.
- Images tagged with `latest` + a version tag for traceability.

### 3. Database → In-Cluster (not Cloud RDS)
- MySQL runs as a **StatefulSet** inside the `database` namespace.
- PVC (10Gi) attached for data persistence.
- Connection via internal DNS: `mysql.database.svc.cluster.local:3306`.
- Decision reason: simplifies demo/dev, no external cloud DB dependency.

### 4. Namespace Isolation
- 3 namespaces: `database`, `backend`, `frontend`.
- Network communication via Kubernetes internal DNS (ClusterIP services).
- Credentials shared via **Secrets**; non-sensitive config via **ConfigMap**.

### 5. Ingress
- **ingress-nginx** installed via Helm (not static manifest).
- Ingress resource in `frontend` namespace routes `/` → `quotes-frontend-service:5002`.

### 6. Files to Remove (Cleanup)
| File | Reason |
|---|---|
| `docker-compose.yml` | Not needed — deploying to K8s, not Compose |
| `compose-commands.sh` | Docker Compose helper, irrelevant |
| `db-commands.sh` | Manual DB debug steps, not needed |
| `manifests/` | All manifests removed — will be written fresh during deployment |
| `README.md` | Outdated — replaced by `task.md` + `decision.md` |

### 7. Manifests Written Fresh
- All K8s manifest YAML files will be written from scratch during deployment phases.
- Image references will use ECR URIs directly (no need to update existing files).

### 8. Tooling
- **AWS CLI** → ECR login, image push.
- **kubectl** → apply manifests.
- **eksctl** → create/manage EKS cluster.
