# Kubernetes Deployment Guide

This repository contains two practical, end-to-end guides for deploying containerized applications on Kubernetes. Whether you are just starting out or looking to expand into production-grade cluster management, these projects cover the core concepts and real-world challenges you will face.

---

## Projects Overview

| Folder | Architecture | Platform | Highlights |
|---|---|---|---|
| **[2-tier-app](2-tier-app/)** | Frontend + Backend | AWS EC2, kind, MetalLB | Service discovery, Nginx reverse proxy, Docker Hub |
| **[3-tier-app](3-tier-app/)** | Frontend + Backend + Database | Amazon EKS, ECR, ingress-nginx | StatefulSets, PVCs, Secrets, ConfigMaps, Ingress |

---

## [2-tier-app](2-tier-app/)

A lightweight, two-tier application demonstrating the fundamentals of container orchestration. It is perfect for understanding how a frontend and backend communicate securely inside a Kubernetes cluster.

**Key Features:**
- **Frontend:** Static HTML/CSS/JS served by Nginx.
- **Backend:** Node.js + Express API.
- **Networking:** Uses a LoadBalancer (MetalLB) for the frontend and a ClusterIP service for the backend, ensuring the backend is not exposed externally.
- **Proxying:** Nginx acts as a reverse proxy, routing `/api/*` requests from the frontend to the backend service internally.
- **Platform:** Deployed on a local `kind` (Kubernetes in Docker) cluster running on an AWS EC2 instance.

[Read the full guide for 2-tier-app →](2-tier-app/README.md)

---

## [3-tier-app](3-tier-app/)

A production-style, three-tier Quotes application that introduces data persistence and more complex Kubernetes resources. This guide walks through building, pushing, and deploying a full-stack application on a managed Amazon EKS cluster.

**Key Features:**
- **Frontend:** Flask web UI for displaying and adding quotes.
- **Backend:** Flask REST API for handling business logic.
- **Database:** MySQL 8.0 managed as a Kubernetes StatefulSet with a PersistentVolumeClaim (PVC) for data durability.
- **Networking:** Exposes the application to the internet using an ingress-nginx controller on AWS.
- **Design:** Uses separate namespaces for each tier, Kubernetes Secrets for passwords, and ConfigMaps for configuration.
- **Troubleshooting:** Includes detailed runbooks for real-world issues encountered during deployment, such as EBS CSI driver failures and namespace-scoped ConfigMap errors.

[Read the full guide for 3-tier-app →](3-tier-app/README.md)

---

## How to Use This Repository

1.  **Start Simple:** Navigate to `2-tier-app/` to get comfortable with Docker, Kubernetes basics, and service discovery.
2.  **Level Up:** Move to `3-tier-app/` to learn about persistent storage, managed Kubernetes (EKS), container registries (ECR), and handling real-world deployment issues.
3.  **Follow Along:** Each project has its own `README.md` with step-by-step instructions, commands, and screenshots to guide you through the entire process.

---

## Prerequisites

While each project has its own specific requirements, you will generally need:

- **Docker:** For building container images.
- **kubectl:** For interacting with Kubernetes clusters.
- **A Cloud Account:** AWS for the EKS deployment in `3-tier-app`, or an EC2 instance for the `kind` cluster in `2-tier-app`.

---

## License

Both projects in this repository are shared for educational purposes. Check the individual folders for any specific licensing details.