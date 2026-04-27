---
layout: course
title: "Administration Systèmes avancée"
semestre: "S8"
type_cours: "systèmes"
tags: ["Kubernetes", "Terraform", "Helm", "HA", "cloud", "AWS", "Prometheus", "Grafana", "GitOps", "ArgoCD"]
---

## Introduction

Ce cours approfondit l'administration des systèmes en production : orchestration Kubernetes avancée, Infrastructure as Code avec Terraform, haute disponibilité, observabilité et pratiques GitOps. Il fait suite au cours d'Admin-Sys S7 (Docker, K8s bases, Ansible, CI/CD).

---

## Kubernetes avancé

### StatefulSets — Applications avec état

Pour les bases de données, brokers, caches qui nécessitent des identités stables et un stockage persistant.

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: "postgres"   # Headless service associé
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:           # PVC créé automatiquement pour chaque pod
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
      storageClassName: fast-ssd
---
# Headless Service (pas de ClusterIP — DNS direct vers les pods)
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  clusterIP: None               # Headless
  selector:
    app: postgres
  ports:
  - port: 5432
# DNS: postgres-0.postgres.default.svc.cluster.local
```

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70    # Scale si CPU > 70%
  - type: Resource
    resource:
      name: memory
      target:
        type: AverageValue
        averageValue: 512Mi
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Pods
        value: 4                  # max 4 pods ajoutés à la fois
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300   # Attendre 5 min avant de scale down
```

### Network Policies — Segmentation réseau

```yaml
# Politique : seul le pod 'api' peut atteindre postgres sur le port 5432
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgres-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api          # Seulement les pods 'api'
    ports:
    - protocol: TCP
      port: 5432
  egress: []                # Postgres ne peut pas initier de connexion
```

### Resource Requests & Limits + QoS

```yaml
resources:
  requests:                 # Ressources garanties (scheduling)
    cpu: "250m"             # 250 millicores = 0.25 CPU
    memory: "256Mi"
  limits:                   # Ressources maximales (OOM kill si dépassé)
    cpu: "1000m"
    memory: "512Mi"

# Classes QoS :
# Guaranteed   : requests == limits (toujours)
# Burstable    : requests < limits
# BestEffort   : aucun request/limit (expulsé en premier sous pression)
```

---

## Terraform — Infrastructure as Code

### Concepts fondamentaux

```hcl
# Providers : interfaces avec les APIs cloud
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  # Backend S3 pour le state file partagé
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-3"
    encrypt        = true
    dynamodb_table = "terraform-locks"   # Verrouillage concurrent
  }
}

provider "aws" {
  region = var.aws_region
}
```

### Module AWS complet (VPC + EC2 + RDS)

```hcl
# variables.tf
variable "aws_region"    { default = "eu-west-3" }
variable "env"           { default = "prod" }
variable "instance_type" { default = "t3.medium" }
variable "db_password"   {
  sensitive = true      # Ne jamais afficher dans les logs
}

# main.tf — VPC
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.env}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false          # HA : un NAT par AZ
  enable_dns_hostnames = true
}

# EC2 Auto Scaling Group
resource "aws_launch_template" "app" {
  name_prefix   = "${var.env}-app-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.app.id]
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum install -y docker
    systemctl enable --now docker
    docker run -d -p 8080:8080 myapp:latest
  EOF
  )

  lifecycle { create_before_destroy = true }
}

resource "aws_autoscaling_group" "app" {
  name                = "${var.env}-app-asg"
  target_group_arns   = [aws_lb_target_group.app.arn]
  min_size            = 2
  max_size            = 10
  desired_capacity    = 3
  vpc_zone_identifier = module.vpc.private_subnets

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.env}-app"
    propagate_at_launch = true
  }
}

# RDS PostgreSQL Multi-AZ
resource "aws_db_instance" "postgres" {
  identifier           = "${var.env}-postgres"
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_encrypted    = true

  db_name  = "appdb"
  username = "admin"
  password = var.db_password

  multi_az               = true     # HA automatique
  backup_retention_period = 7
  deletion_protection    = true

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  tags = { Environment = var.env }
}

# outputs.tf
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}
output "rds_endpoint" {
  value     = aws_db_instance.postgres.endpoint
  sensitive = true
}
```

### Commandes Terraform

```bash
terraform init          # Initialiser (télécharger providers)
terraform validate      # Valider la syntaxe
terraform plan          # Prévisualiser les changements
terraform plan -out=tfplan   # Sauvegarder le plan
terraform apply tfplan  # Appliquer le plan sauvegardé
terraform destroy       # Détruire l'infrastructure
terraform state list    # Lister les ressources dans le state
terraform import aws_instance.app i-1234567890abcdef0  # Importer ressource existante
```

---

## Haute disponibilité (HA)

### Patterns HA

```
Active/Active
  Load Balancer
  ├── Node 1 (actif)  → traite le trafic
  └── Node 2 (actif)  → traite le trafic
  Avantage : utilisation maximale des ressources

Active/Passive
  Load Balancer (VIP)
  ├── Node 1 (primaire) → traite le trafic
  └── Node 2 (standby) → prêt à prendre le relais
  Avantage : simplicité, cohérence des données

Quorum (Kubernetes, etcd, Raft)
  3 nœuds minimum : quorum = ⌊N/2⌋ + 1
  3 nœuds → tolère 1 panne
  5 nœuds → tolère 2 pannes
```

### Métriques de disponibilité

| Disponibilité | Downtime annuel | Downtime mensuel |
|--------------|-----------------|-----------------|
| 99% | 3j 15h 36min | 7h 18min |
| 99.9% (3 nines) | 8h 45min | 43min |
| 99.99% (4 nines) | 52min | 4.3min |
| 99.999% (5 nines) | 5.2min | 26s |

### HAProxy — Load balancing

```
# /etc/haproxy/haproxy.cfg
global
    log stdout format raw local0
    maxconn 50000

defaults
    mode http
    timeout connect 5s
    timeout client  30s
    timeout server  30s
    option httplog
    option forwardfor

frontend web
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/cert.pem
    redirect scheme https if !{ ssl_fc }
    default_backend app_servers

backend app_servers
    balance leastconn
    option httpchk GET /health
    http-check expect status 200
    server app1 10.0.1.10:8080 check inter 2s rise 2 fall 3
    server app2 10.0.1.11:8080 check inter 2s rise 2 fall 3
    server app3 10.0.1.12:8080 check inter 2s rise 2 fall 3 backup
```

---

## Observabilité avancée — Stack Prometheus/Grafana

### Prometheus — Métriques

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
  - static_configs:
    - targets: ['alertmanager:9093']

rule_files:
  - "alerts/*.yml"

scrape_configs:
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
      action: replace
      target_label: __metrics_path__
      regex: (.+)
```

### PromQL — Requêtes essentielles

```promql
# CPU usage par pod
rate(container_cpu_usage_seconds_total[5m])

# Taux d'erreur HTTP (5xx)
sum(rate(http_requests_total{status=~"5.."}[5m])) /
sum(rate(http_requests_total[5m])) * 100

# Latence P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Disponibilité mémoire
(node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100

# Alertes : CPU > 80% pendant 5 min
- alert: HighCPUUsage
  expr: (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance)) > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "CPU élevé sur {{ $labels.instance }}"
    description: "CPU à {{ $value | humanizePercentage }}"
```

---

## GitOps avec ArgoCD

### Principe GitOps

```
Git (source de vérité)
    │  push
    ↓
CI Pipeline (build + push image)
    │  met à jour le tag d'image dans Git
    ↓
ArgoCD (compare Git ↔ cluster)
    │  détecte la dérive
    ↓
Kubernetes Cluster (applique l'état désiré)
```

### Configuration ArgoCD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/org/k8s-manifests
    targetRevision: main
    path: apps/my-app/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true           # Supprimer les ressources orphelines
      selfHeal: true        # Corriger les dérives manuelles
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### Kustomize — Overlays par environnement

```
k8s/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml   # replicas: 1, image: tag-dev
    │   └── patch-replicas.yaml
    └── prod/
        ├── kustomization.yaml   # replicas: 5, image: tag-prod
        └── patch-replicas.yaml
```

```yaml
# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
- ../../base
namePrefix: prod-
namespace: production
images:
- name: myapp
  newTag: "1.2.3"
patches:
- path: patch-replicas.yaml
  target:
    kind: Deployment
    name: myapp
```

---

## Sécurité Kubernetes

### RBAC — Contrôle d'accès

```yaml
# ServiceAccount pour une application
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: production
---
# Role (namespaced) — permissions limitées
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["pods", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch", "update", "patch"]
---
# Binding
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-role-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: app-service-account
  namespace: production
roleRef:
  kind: Role
  name: app-role
  apiGroup: rbac.authorization.k8s.io
```

### Pod Security Standards

```yaml
# Namespace avec politique restrictive
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

```yaml
# SecurityContext sécurisé
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
```

---

## Résumé architecture production

```
Internet
    │
[CDN / WAF]
    │
[Load Balancer HA (HAProxy/ALB)]
    │
[Kubernetes Cluster]
  ├── Ingress Controller (nginx/traefik)
  ├── App Pods (HPA 2→20)
  ├── Monitoring (Prometheus + Grafana)
  └── GitOps (ArgoCD)
    │
[Persistent Layer]
  ├── RDS PostgreSQL (Multi-AZ)
  ├── Redis (Sentinel/Cluster)
  └── S3 (Stockage objets)
    │
[Observabilité]
  ├── Prometheus (métriques)
  ├── Loki (logs)
  └── Jaeger (tracing)
```
