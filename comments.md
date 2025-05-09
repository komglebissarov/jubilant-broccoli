# 🚀 Project Setup
---
shoutout to LLMs for the emojis 😊

## 📋 Prerequisites

- 🐳 **Docker**  
  https://docs.docker.com/engine/install/

- ☸️ **kubectl with GKE plugins**  
  https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl

- 🟢 **Node.js (via nvm)**  
  https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating

- 🏗️ **CDK for Terraform (cdktf)**  
  https://developer.hashicorp.com/terraform/tutorials/cdktf/cdktf-install

- 📐 **Terraform**  
  https://developer.hashicorp.com/terraform/install

- ☁️ **gcloud CLI (should also log in)**  
  https://cloud.google.com/sdk/docs/install

---

## 🛠️ 3. Infrastructure as Code (IaC)

To run:

- 🔑 Get some GCP project ID. Make sure to have admin rights.
- ✅ Ensure **Kubernetes Engine API** and **Compute Engine API** are enabled for the project.
- 🧾 Set `projectId` in `terraform/main.ts`.

```bash
cd terraform

# This should output Postgres internal IP. Can be used in the testing step.
cdktf deploy
```

To test SQL network connectivity:

```bash
gcloud container clusters get-credentials k8s-main --location=europe-west1-c
kubectl run -it --rm --image ubuntu test-pod bash

apt update && apt install netcat-traditional
nc -vz <pgIp> 5432
# Expect: (UNKNOWN) [<pgIp>] 5432 (?) open
```

---

## 🔁 2. CI/CD

> ⚠️ The pipeline won't run as-is on GitHub without runner network and auth infrastructure.  
> ✅ You can test locally using your authenticated gcloud session:

```bash
PROJECT_ID="amazing-etching-459312-c7"
IMAGE_ID="europe-west1-docker.pkg.dev/${PROJECT_ID}/sisuxgleb/express:latest"

gcloud config set project $PROJECT_ID

gcloud auth configure-docker europe-west1-docker.pkg.dev
docker build -t $IMAGE_ID ./application
docker push $IMAGE_ID

gcloud container clusters get-credentials k8s-main --location=europe-west1-c

# "Hacking" with sed to avoid configuring more complex templating mechanisms
sed -i "s|IMAGE_ID|${IMAGE_ID}|g" kubernetes/deployment.yaml

# Applying manifests directly. 50/50 for helm chart with given scale and projected EOL.
kubectl apply -f kubernetes/
```

To receive "You have successfully run the sisu-tech application!":
```bash
# Get your load balancer public IP (VPC->IP addresses)
curl $LB_IP
```

---

## 🧪 1. Docker Local Build

```bash
cd application
docker build -t express .
docker run express
```
