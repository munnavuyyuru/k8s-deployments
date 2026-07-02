# 2-Tier Application Deployment on Kubernetes (AWS EC2 + kind + MetalLB)

> A production‑style deployment of a containerized frontend and backend application on Kubernetes, demonstrating service discovery, reverse proxy architecture, containerization, and cloud‑native deployment practices using AWS EC2, kind, and MetalLB.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Application Screenshots](#application-screenshots)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Deployment Workflow](#deployment-workflow)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone Repository](#step-1-clone-repository)
  - [Step 2: Build and Push Docker Images](#step-2-build-and-push-docker-images)
  - [Step 3: Prepare EC2 Instance](#step-3-prepare-ec2-instance)
  - [Step 4: Create kind Cluster with MetalLB](#step-4-create-kind-cluster-with-metallb)
  - [Step 5: Deploy to Kubernetes](#step-5-deploy-to-kubernetes)
  - [Step 6: Access the Application](#step-6-access-the-application)
- [Validation Steps](#validation-steps)
- [Troubleshooting](#troubleshooting)
- [Lessons Learned](#lessons-learned)
- [Future Enhancements](#future-enhancements)
- [Project Highlights](#project-highlights)
- [Author](#author)
- [License](#license)

---

## Project Overview

This project demonstrates how to deploy a multi‑tier application on Kubernetes while following modern DevOps and cloud‑native practices.

The application consists of:
* **Frontend** – static HTML, CSS, JavaScript served via Nginx
* **Backend** – Node.js + Express API exposing `/api/health` and `/api/data`
* **Docker Containerization** – multi‑stage builds for both services
* **Docker Hub Image Registry** – images pushed to a public repository
* **Kubernetes Deployments & Services** – separate Deployments with ClusterIP Services; Frontend exposed via LoadBalancer (MetalLB)
* **Nginx Reverse Proxy** – forwards `/api/*` requests from the frontend to the backend service
* **Internal Service Communication** – backend remains cluster‑internal only
* **Cloud Deployment** – AWS EC2 instance running a kind cluster with MetalLB providing load‑balancing

The primary goal is to showcase secure frontend‑to‑backend communication within a Kubernetes cluster while exposing only the frontend to end users.

---

## Architecture

### System Architecture Diagram
![Architecture Diagram](docs/architecture-diagram.png)

### Example Flow
```text
User Browser
          │
          ▼
Frontend Service (LoadBalancer via MetalLB)
          │
          ▼
Frontend Pod (Nginx)
          │
          ▼
Nginx Reverse Proxy (configured via ConfigMap)
          │
          ▼
Backend Service (ClusterIP:8001)
          │
          ▼
Backend Pod (Node.js API)
```

*The browser only ever talks to the frontend. The Nginx ConfigMap inside the frontend pod proxies `/api/*` paths to the backend service, keeping the backend private inside the cluster.*

---

## Application Screenshots

### Frontend UI
![Frontend UI](docs/frontend-ui.png)

### API Communication Success
![API Communication](docs/api-success.png)
*Capture: GET /api/health → Status: 200 OK*

### Kubernetes Resources
![Kubernetes Resources](docs/k8s-resources.png)
*Example command: `kubectl get all -n 2tier-app`*

### Live Deployment (AWS EC2 + kind + MetalLB)
![Live Deployment](docs/svc-portforward.png)
*Shows the service exposed via MetalLB’s external IP; alternatively, port‑forward can be used for testing.*

---

## Key Features

* Multi‑tier architecture (frontend + backend)
* Containerized frontend and backend with Docker
* Docker Hub image registry integration
* Kubernetes‑native deployment (Deployments, Services)
* Secure image pulling using `imagePullSecrets` (secret `regcred`)
* Internal backend isolation (ClusterIP only)
* Nginx reverse proxy implementation for secure service‑to‑service communication
* Local development support (Docker Desktop / kind)
* AWS EC2 + kind + MetalLB cloud deployment support
* Comprehensive troubleshooting documentation
* Production‑style architecture ready for extension

---

## Technology Stack

| Category           | Technology            |
|--------------------|-----------------------|
| Frontend           | HTML5, CSS3, JavaScript |
| Backend            | Node.js, Express.js   |
| Containers         | Docker                |
| Container Registry | Docker Hub            |
| Orchestration      | Kubernetes (kind)     |
| Local Cluster      | kind                  |
| Load Balancer      | MetalLB               |
| Cloud Provider     | AWS EC2               |
| Reverse Proxy      | Nginx                 |
| CLI Tools          | kubectl, Docker CLI   |
| Secret Management  | Kubernetes `imagePullSecrets` |

---

## Repository Structure

```
2-tier-app/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── Dockerfile
├── k8s-manifest/
│   ├── backend.yaml
│   ├── frontend.yaml
│   └── frontend-nginx-config.yaml
├── docs/
│   ├── architecture-diagram.png
│   ├── frontend-ui.png
│   ├── api-success.png
│   ├── k8s-resources.png
│   ├── svc-portforward.png
│   └── apply-manifest.png
├── README.md
└── .gitignore
```

---

## Deployment Workflow

```text
Developer
    │
    ▼
Source Code
    │
    ▼
Docker Build (local)
    │
    ▼
Docker Hub (push)
    │
    ▼
Kubernetes Deployment (on EC2‑hosted kind cluster)
    │
    ▼
Service Discovery (ClusterIP Services)
    │
    ▼
Nginx Reverse Proxy (ConfigMap)
    │
    ▼
Backend API
    │
    ▼
Response to User
```

---

## Getting Started

### Prerequisites

| Tool               | Purpose                               | Install Link |
|--------------------|---------------------------------------|--------------|
| Git                | Clone the repository                  | https://git-scm.com |
| Docker (>= 20.10)  | Build container images                | https://docs.docker.com/engine/install/ |
| kubectl            | Interact with Kubernetes clusters     | https://kubernetes.io/docs/tasks/tools/install-kubectl/ |
| kind               | Run local Kubernetes clusters         | https://kind.sigs.k8s.io/ |
| AWS CLI (optional) | Manage AWS EC2 resources              | https://aws.amazon.com/cli/ |
| A Docker Hub account | Store and pull images                | https://hub.docker.com |

> **Note:** The manifests reference images `bhargav072/2-tire-app-backend:latest` and `bhargav072/2-tire-app-frontend:v1.1`. If you wish to use your own images, either push to Docker Hub with those exact tags or edit the image fields in the manifests and update the `imagePullSecrets` secret name accordingly.

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd 2-tier-app
```

### Step 2: Build and Push Docker Images

#### Backend

```bash
cd backend
docker build -t your-dockerhub-user/2-tire-app-backend:latest .
docker push your-dockerhub-user/2-tire-app-backend:latest
cd ..
```

#### Frontend

```bash
cd frontend
docker build -t your-dockerhub-user/2-tire-app-frontend:v1.1 .
docker push your-dockerhub-user/2-tire-app-frontend:v1.1
cd ..
```

> Replace `your-dockerhub-user` with your actual Docker Hub username.

### Step 3: Prepare EC2 Instance

1. Launch an EC2 instance (t2.micro or larger) in a public subnet.
2. Attach a security group that allows inbound traffic on ports **80**, **443**, and the NodePort range (e.g., 30000‑32767) if you plan to expose services via NodePort; MetalLB will use port 80 for the LoadBalancer service.
3. SSH into the instance:

   ```bash
   ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>
   ```

4. Install Docker:

   ```bash
   sudo yum update -y
   sudo amazon-linux-extras install docker -y
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   # Log out and back in for group changes to take effect
   ```

5. Install `kubectl` and `kind` (follow the official guides):

   ```bash
   # kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x ./kubectl
   sudo mv ./kubectl /usr/local/bin/kubectl

   # kind
   curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64
   chmod +x ./kind
   sudo mv ./kind /usr/local/bin/kind
   ```

### Step 4: Create kind Cluster with MetalLB

Create a `kind-config.yaml` file in the repository root (or on the EC2 instance) with the following content to map host port 80 to the kind nodes (required for MetalLB to expose services externally):

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
networking:
  apiServerAddress: "0.0.0.0"
  apiServerPort: 6443
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        listenAddress: "0.0.0.0"
        protocol: tcp
```

Now create the cluster:

```bash
kind create cluster --name k8s-demo --config kind-config.yaml
```

Ensure your `kubectl` context points to the new cluster:

```bash
kubectl config use-context kind-k8s-demo
```

#### Install MetalLB

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.7/config/manifests/metallb-native.yaml
```

Create an IP address pool for MetalLB. Since we are on a single EC2 node, we can use a small range from the Docker bridge network or a static IP. Example using `172.18.255.0/24` (adjust if it conflicts with your VPC):

```bash
cat <<EOF | kubectl apply -f -
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb-system
spec:
  addresses:
  - 172.18.255.0/24
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: empty
  namespace: metallb-system
spec:
  ipAddressPools:
  - first-pool
EOF
```

### Step 5: Deploy to Kubernetes

#### Create the Namespace

The manifests use namespace `2tier-app`:

```bash
kubectl create namespace 2tier-app
```

#### Create the Docker Hub Pull Secret

The manifests reference an imagePullSecret named `regcred`. Create it with your Docker Hub credentials:

```bash
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<your-dockerhub-username> \
  --docker-password=<your-dockerhub-password> \
  --docker-email=<your-email> \
  --namespace=2tier-app
```

Verify:

```bash
kubectl get secret regsec -n 2tier-app
```

#### Apply the Manifests

```bash
kubectl apply -f k8s-manifest/backend.yaml -n 2tier-app
kubectl apply -f k8s-manifest/frontend-nginx-config.yaml -n 2tier-app
kubectl apply -f k8s-manifest/frontend.yaml -n 2tier-app
```

![Apply Manifests](docs/apply-manifest.png)

#### Wait for Pods to be Ready

```bash
kubectl wait --for=condition=ready pod -l app=frontend -n 2tier-app --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend -n 2tier-app --timeout=120s
```

### Step 6: Access the Application

#### Option A: Using MetalLB LoadBalancer (recommended)

Get the external IP assigned to the frontend service:

```bash
kubectl get svc frontend -n 2tier-app
```

You should see output similar to:

```
NAME       TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)        AGE
frontend   LoadBalancer   10.96.123.45   172.18.255.10   80:30000/TCP   2m
```

Open a browser on your local machine (or anywhere with access to the EC2 public IP) and navigate to:

```
http://<EXTERNAL-IP>
```

#### Option B: Using kubectl port‑forward (for quick testing)

```bash
kubectl port-forward svc/frontend 8080:80 -n 2tier-app
```

Then open `http://localhost:8080` in your browser.

---

## Validation Steps

Once the frontend is reachable:

1. Click **“Check Health”** – should display a green status and a JSON response from `/api/health`.
2. Click **“Refresh Data”** – should display the backend message and feature list from `/api/data`.
3. Open **DevTools → Network** tab and verify that requests are made to `http://<host>:<port>/api/...` (not to `localhost:8001`).
4. Confirm that the backend pods are only accessible via the cluster IP:

   ```bash
   kubectl get svc backend -n 2tier-app
   ```

   Example output:

   ```
   NAME       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
   backend    ClusterIP   10.96.200.12   <none>        8001/TCP   2m
   ```

   Try to curl the ClusterIP from inside a pod (or from the node) – it should work. Attempting to access it directly from outside the cluster should fail.

---

## Troubleshooting

| Symptom                                                            | Likely Cause                                                                     | Fix                                                                                              |
|--------------------------------------------------------------------|----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Frontend loads, but API calls fail with **Failed to fetch**       | Frontend JavaScript uses `http://localhost:8001` (browser‑side localhost)        | Edit `frontend/script.js`: change `const API_BASE = "http://localhost:8001";` to `const API_BASE = "/api";` rebuild the frontend image and redeploy. |
| API calls succeed but return **404/500**                           | Backend not reachable from Nginx (service mis‑configured)                        | Verify `frontend-nginx-config.yaml` contains `proxy_pass http://backend:8001/api/`; check backend pod logs (`kubectl logs -n <ns> <backend-pod>`). |
| Cannot access the service externally                               | Service type is `ClusterIP`; no ingress/NodePort/LoadBalancer exposed            | Use `kubectl port-forward` for testing, or expose via NodePort/LoadBalancer (MetalLB) as needed. |
| `ImagePullBackOff` or `ErrImagePull`                               | Image not found or tag mismatch                                                  | Ensure you built and pushed the image with the correct tag; for kind, load images with `kind load docker-image <image>:<tag>`. |
| MetalLB does not assign an external IP                             | IP address pool not correctly configured or overlaps with existing network       | Verify `metallb-config.yaml` contains a valid range (e.g., your EC2 private IP/32) and that the range does not conflict with Docker/kind networking. |
| `kubectl port-forward` works, but NodePort/LoadBalancer does not  | Firewall or security group blocking the node port                               | Open the required ports in the EC2 security group and/or the instance’s firewall (`iptables`, `firewalld`). |
| Backend pod crashes with `Error: Cannot find module ...`           | Missing dependencies in the container image                                      | Re‑build the backend image after ensuring `package.json` is copied and `npm install` runs in the Dockerfile. |
| Nginx returns 502 Bad Gateway                                      | Backend service not reachable (wrong service name/port)                          | Confirm the Service name and port in the ConfigMap (`backend:8001`). Use `kubectl get svc` to verify. |

**Tip:** Always inspect the **Network** tab in browser DevTools to see the exact URL being called and the response status. This quickly reveals whether the issue is client‑side (wrong URL) or server‑side (backend unreachable).

---

## Lessons Learned

* **Context matters:** `localhost` means different things in a browser, container, pod, or VM. Always trace the request origin.
* **Static assets cannot read Kubernetes env‑vars:** JS running in the browser cannot access container environment variables. Use relative paths and let the web server (NGINX) handle proxying.
* **NGINX as a reverse proxy** is a simple, secure way to hide backend services while still serving static files.
* **Simplicity wins:** Changing one line in `script.js` and using the existing NGINX config solved a seemingly complex networking issue.
* **Validate in the browser:** The DevTools Network tab is invaluable for debugging frontend‑backend communication in Kubernetes.
* **Environment parity:** Keep local (Docker Desktop/kind) and cloud (AWS EC2 + kind) manifests identical to avoid “works on my machine” issues.
* **Observability:** Adding liveness/readiness probes and centralized logging (e.g., EFK stack) improves production readiness.

---

## Future Enhancements

* Add Helm charts for easier versioned deployments.
* Implement CI/CD pipeline with GitHub Actions (build, push images, deploy to kind/EKS).
* Introduce an Ingress Controller (NGINX or Traefik) with TLS termination.
* Add Prometheus + Grafana for metrics collection and visualization.
* Implement centralized logging (EFK or Loki).
* Add Horizontal Pod Autoscaler (HPA) based on CPU/memory or custom metrics.
* Integrate service mesh (Istio/Linkerd) for advanced traffic management.
* Add automated end‑to‑end tests using Cypress or Playwright.
* Provide a `makefile` or script to streamline build, push, and deploy steps.
* Include a `SECURITY.md` with vulnerability scanning instructions (Trivy, Dependabot).

---

## Project Highlights

✔ Multi‑Tier Application Architecture  
✔ Docker Containerization  
✔ Docker Hub Registry Integration  
✔ Kubernetes Deployment (Deployments, Services)  
✔ Secure imagePullSecrets Configuration  
✔ Internal Service Communication (ClusterIP only)  
✔ Reverse Proxy Pattern (NGINX)  
✔ Cloud Deployment Ready (AWS EC2 + kind + MetalLB)  
✔ Troubleshooting Documentation (covers common pitfalls)  
✔ Real‑World Networking Concepts (service discovery, DNS, proxying)  
✔ Beginner Friendly (step‑by‑step guides)  
✔ Interview Ready (demonstrates DevOps, containers, orchestration)  

---

## Author

**Your Name**  
DevOps Engineer | Cloud Enthusiast | Kubernetes Practitioner  

GitHub: https://github.com/your-username  
LinkedIn: https://linkedin.com/in/your-profile  

---

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.