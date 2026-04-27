---
layout: course
title: "Administration Systèmes avancée"
semestre: "S7"
type_cours: "systèmes"
tags: ["Docker", "Kubernetes", "Ansible", "CI/CD", "Prometheus", "Grafana", "infrastructure as code"]
---

## Introduction

Ce cours couvre l'infrastructure moderne : conteneurisation avec Docker, orchestration avec Kubernetes, automatisation avec Ansible et déploiement continu avec GitLab CI/CD.

---

## Docker

### Concepts fondamentaux

```
Image (lecture seule) ──► Conteneur (instance en cours d'exécution)
                                │
                          Couche lecture/écriture
```

```bash
# Commandes essentielles
docker images                              # Lister les images locales
docker ps -a                               # Lister tous les conteneurs
docker pull nginx:alpine                   # Télécharger une image
docker run -d -p 8080:80 --name web nginx  # Démarrer en background
docker exec -it web sh                     # Shell interactif
docker logs -f web                         # Suivre les logs
docker stats                               # Utilisation CPU/RAM en temps réel
docker inspect web | jq '.[0].NetworkSettings.IPAddress'
```

### Dockerfile optimisé

```dockerfile
# Multi-stage build — image finale minimale
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim AS runtime
# Utilisateur non-root (sécurité)
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
# Copier uniquement les dépendances installées
COPY --from=builder /root/.local /home/app/.local
COPY --chown=app:app . .
USER app
ENV PATH=/home/app/.local/bin:$PATH
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:5000/health || exit 1
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "app:create_app()"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.9'

services:
  web:
    build: ./api
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/app
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M

  db:
    image: postgres:16-alpine
    volumes:
      - pg_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on: [web]

volumes:
  pg_data:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## Kubernetes

### Architecture

```
Control Plane                          Worker Nodes
┌─────────────────────┐            ┌──────────────────┐
│  API Server          │            │  kubelet         │
│  etcd (état cluster) │◄──────────►│  kube-proxy      │
│  Scheduler           │            │  Container Runtime│
│  Controller Manager  │            │  (containerd)    │
└─────────────────────┘            └──────────────────┘
```

### Ressources principales

```yaml
# Deployment — gère le cycle de vie des pods
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: api
        version: "2.1.0"
    spec:
      containers:
      - name: api
        image: registry.example.com/api:2.1.0
        ports:
        - containerPort: 5000
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "1000m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                app: api
            topologyKey: kubernetes.io/hostname
```

```yaml
# Service — exposition d'un Deployment
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: ClusterIP

---
# Ingress — routage HTTP depuis l'extérieur
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/rate-limit: "100"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts: [api.example.com]
    secretName: api-tls
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

```bash
# Commandes kubectl essentielles
kubectl get pods -n production -o wide
kubectl describe pod api-deployment-xxx -n production
kubectl logs -f api-deployment-xxx -n production --previous
kubectl exec -it api-deployment-xxx -n production -- bash
kubectl rollout status deployment/api-deployment -n production
kubectl rollout undo deployment/api-deployment -n production   # Rollback
kubectl scale deployment api-deployment --replicas=5 -n production
kubectl top pods -n production  # Utilisation CPU/RAM
kubectl get events --sort-by='.lastTimestamp' -n production
```

---

## Ansible

### Structure d'un projet

```
ansible-project/
├── inventory/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   │       ├── all.yml
│   │       └── webservers.yml
│   └── staging/
│       └── hosts.yml
├── roles/
│   ├── common/
│   │   ├── tasks/main.yml
│   │   ├── handlers/main.yml
│   │   └── templates/
│   └── nginx/
│       ├── tasks/main.yml
│       └── templates/nginx.conf.j2
└── playbooks/
    ├── site.yml
    └── deploy-app.yml
```

```yaml
# inventory/production/hosts.yml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
          ansible_host: 192.168.1.10
        web2.example.com:
          ansible_host: 192.168.1.11
    databases:
      hosts:
        db1.example.com:
          ansible_host: 192.168.1.20
  vars:
    ansible_user: ansible
    ansible_ssh_private_key_file: ~/.ssh/ansible_key
    ansible_python_interpreter: /usr/bin/python3
```

```yaml
# playbooks/deploy-app.yml
---
- name: Déployer l'application
  hosts: webservers
  become: true
  vars:
    app_version: "{{ version | default('latest') }}"
    app_dir: /opt/myapp

  tasks:
    - name: Installer les dépendances système
      ansible.builtin.package:
        name: "{{ item }}"
        state: present
      loop: [git, python3, python3-pip, nginx]

    - name: Créer l'utilisateur applicatif
      ansible.builtin.user:
        name: appuser
        system: true
        shell: /bin/bash
        home: "{{ app_dir }}"

    - name: Déployer le code
      ansible.builtin.git:
        repo: https://github.com/org/app.git
        dest: "{{ app_dir }}"
        version: "{{ app_version }}"
        force: true
      notify: Restart application

    - name: Installer les dépendances Python
      ansible.builtin.pip:
        requirements: "{{ app_dir }}/requirements.txt"
        virtualenv: "{{ app_dir }}/venv"

    - name: Copier la configuration Nginx
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/myapp
        owner: root
        mode: '0644'
      notify: Reload nginx

  handlers:
    - name: Restart application
      ansible.builtin.systemd:
        name: myapp
        state: restarted
        daemon_reload: true

    - name: Reload nginx
      ansible.builtin.systemd:
        name: nginx
        state: reloaded
```

---

## GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

test:
  stage: test
  image: python:3.12-slim
  cache:
    key: $CI_COMMIT_REF_SLUG
    paths: [.pip-cache/]
  script:
    - pip install --cache-dir .pip-cache -r requirements-dev.txt
    - pytest tests/ --cov=app --cov-report=xml
    - coverage report --fail-under=80
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

build:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build --cache-from $CI_REGISTRY_IMAGE:latest -t $IMAGE_TAG .
    - docker tag $IMAGE_TAG $CI_REGISTRY_IMAGE:latest
    - docker push $IMAGE_TAG
    - docker push $CI_REGISTRY_IMAGE:latest
  only: [main, develop]

deploy_production:
  stage: deploy
  image: bitnami/kubectl:latest
  environment:
    name: production
    url: https://app.example.com
  script:
    - kubectl set image deployment/api-deployment api=$IMAGE_TAG -n production
    - kubectl rollout status deployment/api-deployment -n production --timeout=5m
  when: manual
  only: [main]
```

---

## Monitoring — Prometheus + Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - /etc/prometheus/alerts/*.yml

alerting:
  alertmanagers:
  - static_configs:
    - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
```

```yaml
# Règle d'alerte
groups:
- name: app_alerts
  rules:
  - alert: HighMemoryUsage
    expr: container_memory_usage_bytes{namespace="production"} > 450 * 1024 * 1024
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Mémoire élevée sur {{ $labels.pod }}"
      description: "Utilisation mémoire : {{ $value | humanize }}B"
```

---

## Résumé

| Outil | Rôle | Commande clé |
|-------|------|-------------|
| Docker | Conteneurisation | `docker build`, `docker-compose up` |
| Kubernetes | Orchestration | `kubectl apply`, `kubectl rollout` |
| Ansible | Configuration/déploiement | `ansible-playbook site.yml` |
| GitLab CI | Pipeline CI/CD | `.gitlab-ci.yml` |
| Prometheus | Collecte métriques | PromQL, `scrape_configs` |
| Grafana | Visualisation | Dashboards, alertes |
