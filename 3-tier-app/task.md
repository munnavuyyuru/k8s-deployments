# Task Plan — Dockerize & Deploy 3-Tier App to EKS

## Phase 1: Clean Unwanted Files

```bash
cd 3-tier-app

rm docker-compose.yml
rm compose-commands.sh
rm db-commands.sh
rm manifests/tls.crt
rm manifests/ingress-nginx-controller.yaml
rm README.md
rm -rf manifests
```

**Keep these files only:**
- `app/`, `api/`, `db/` — application code (unchanged)
- `decision.md`, `task.md` — planning docs
- `.gitignore`

---

## Phase 2: Create ECR Repositories

```bash
aws ecr create-repository --repository-name quotes-db --region <region>
aws ecr create-repository --repository-name quotes-api --region <region>
aws ecr create-repository --repository-name quotes-frontend --region <region>
```

Note the ECR URIs (e.g. `<account>.dkr.ecr.<region>.amazonaws.com/quotes-db`).

> **ECR Cost:** ~$0.10/GB/month storage. 3 images (~500 MB) = ~**$0.005/day**. Same-region pulls to EKS are **free**. Add a **lifecycle policy** after deployment to auto-delete old images and keep costs near zero:
> ```bash
> aws ecr put-lifecycle-policy --repository-name quotes-db --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Expire old images","selection":{"tagStatus":"untagged","countType":"imageCountMoreThan","countNumber":5},"action":{"type":"expire"}}]}'
> aws ecr put-lifecycle-policy --repository-name quotes-api --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Expire old images","selection":{"tagStatus":"untagged","countType":"imageCountMoreThan","countNumber":5},"action":{"type":"expire"}}]}'
> aws ecr put-lifecycle-policy --repository-name quotes-frontend --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Expire old images","selection":{"tagStatus":"untagged","countType":"imageCountMoreThan","countNumber":5},"action":{"type":"expire"}}]}'
> ```

---

## Phase 3: Build & Push Images to ECR

```bash
# Login to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# Build
docker build -t quotes-db ./db
docker build -t quotes-api ./api
docker build -t quotes-frontend ./app

# Tag
docker tag quotes-db:latest <account>.dkr.ecr.<region>.amazonaws.com/quotes-db:latest
docker tag quotes-api:latest <account>.dkr.ecr.<region>.amazonaws.com/quotes-api:latest
docker tag quotes-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/quotes-frontend:latest

# Push
docker push <account>.dkr.ecr.<region>.amazonaws.com/quotes-db:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/quotes-api:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/quotes-frontend:latest
```

---

## Phase 4: Write K8s Manifests Fresh

Write `ns.yaml`, `secrets.yaml`, `config.yaml`, `mysql.yaml`, `quotes-api.yaml`, `quotes-frontend.yaml`, and `ingress.yaml` from scratch with ECR image URIs.

_Step-by-step manifest creation will be done during deployment._

## Phase 5: Create EKS Cluster (if not exists)

```bash
# Option A — via eksctl
eksctl create cluster \
  --name quotes-cluster \
  --region <region> \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --managed

# Option B — via AWS Console + eksctl nodegroup
eksctl create cluster -f cluster.yaml

# Verify
kubectl cluster-info
kubectl get nodes
```

---

## Phase 6: Install Ingress-NGINX Controller

```bash
# Install via Helm (preferred)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace

# Wait for LoadBalancer
kubectl get svc -n ingress-nginx
```

---

## Phase 7: Write & Deploy K8s Manifests

Create the `manifests/` directory with all YAML files, then apply in dependency order:

```bash
mkdir -p manifests

# Write each YAML file (see decision.md for architecture reference)

# Apply in dependency order: DB first, then API, then Frontend
kubectl apply -f manifests/ns.yaml
kubectl apply -f manifests/secrets.yaml
kubectl apply -f manifests/config.yaml
kubectl apply -f manifests/mysql.yaml
kubectl apply -f manifests/quotes-api.yaml
kubectl apply -f manifests/quotes-frontend.yaml
kubectl apply -f manifests/ingress.yaml

# Watch pods come up
kubectl get pods -n database -w
kubectl get pods -n backend -w
kubectl get pods -n frontend -w
```

---

## Phase 8: Verify Deployment

```bash
# Check all resources
kubectl get all -n database
kubectl get all -n backend
kubectl get all -n frontend

# Get Ingress address
kubectl get ingress -n frontend

# If Ingress has an EXTERNAL-IP, open in browser:
# http://<EXTERNAL-IP>
# or if using a custom domain, map it to the LoadBalancer IP
```

---

## Phase 9: Optional — Cleanup

```bash
# Delete all app resources
kubectl delete -f manifests/

# Delete EKS cluster
eksctl delete cluster --name quotes-cluster --region <region>

# Delete ECR repos
aws ecr delete-repository --repository-name quotes-db --force
aws ecr delete-repository --repository-name quotes-api --force
aws ecr delete-repository --repository-name quotes-frontend --force
```
