#!/bin/bash

set -e

echo "Updating system..."
sudo apt update && sudo apt upgrade -y

########################################
# Install Docker
########################################
echo "Installing Docker..."

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable docker
sudo systemctl start docker

sudo usermod -aG docker $USER

echo "Docker installed successfully."

########################################
# Install kubectl
########################################
echo "Installing kubectl..."

curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

echo "kubectl installed successfully."

########################################
# Install Minikube
########################################
echo "Installing Minikube..."

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

echo "Minikube installed successfully."

########################################
# Install helm
########################################
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash


########################################
# Final Info
########################################

echo "========================================"
echo "Installation Complete!"
echo "Please Run --- newgrp docker --- so docker changes can be applied."
echo ""
echo "Check versions:"
echo "  docker --version"
echo "  kubectl version --client"
echo "  minikube version"
echo "  helm version"
echo ""
echo "========================================"