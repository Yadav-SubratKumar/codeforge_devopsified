#!/bin/bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts


helm repo update


kubectl create namespace argocd
kubectl create namespace monitoring


helm upgrade --install argocd argo/argo-cd --namespace argocd
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring
helm upgrade ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx -f values.yaml


kubectl patch svc prometheus-kube-prometheus-prometheus -n monitoring -p '{"spec": {"type": "NodePort"}}'
kubectl patch svc prometheus-grafana -n monitoring -p '{"spec": {"type": "NodePort"}}'
kubectl patch svc prometheus-kube-prometheus-alertmanager -n monitoring -p '{"spec": {"type": "NodePort"}}'


kubectl get secret --namespace monitoring -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d