#!/bin/bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts

helm repo update

kubectl create namespace argocd

helm upgrade --install argocd argo/argo-cd --namespace argocd

kubectl create namespace monitoring

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring

sleep 10 &

kubectl patch svc prometheus-kube-prometheus-prometheus -n monitoring -p '{"spec": {"type": "NodePort"}}'

kubectl patch svc prometheus-grafana -n monitoring -p '{"spec": {"type": "NodePort"}}'

kubectl patch svc prometheus-kube-prometheus-alertmanager -n monitoring -p '{"spec": {"type": "NodePort"}}'