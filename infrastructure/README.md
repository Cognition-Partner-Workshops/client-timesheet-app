# Infrastructure Provisioning Guide

This document outlines the production infrastructure requirements for the Client Timesheet Application.

## 1. Database Service

**Recommended: PostgreSQL**

| Provider | Service | Minimum Specs |
|----------|---------|---------------|
| AWS | RDS for PostgreSQL | 2 vCPUs, 4GB RAM, 100GB gp3 storage |
| GCP | Cloud SQL for PostgreSQL | db-custom-2-4096, 100GB SSD |
| Azure | Azure Database for PostgreSQL | GP_Gen5_2, 100GB storage |

### Configuration
- Enable automated backups with 7-day retention
- Configure read replicas for horizontal read scaling
- Enable SSL/TLS for all connections
- Set up connection pooling (PgBouncer or built-in)
- Use `DATABASE_TYPE=postgres` and `DATABASE_URL` environment variables

See `database/postgres-config.example.js` for connection configuration.

## 2. Secrets Management

| Provider | Service |
|----------|---------|
| AWS | AWS Secrets Manager |
| GCP | GCP Secret Manager |
| Azure | Azure Key Vault |

### Secrets to Store
- `JWT_SECRET` - JWT signing key (min 256-bit)
- `DATABASE_URL` - Database connection string
- `DATABASE_PASSWORD` - Database password (if not in URL)

### Rotation Policy
- Rotate `JWT_SECRET` every 90 days
- Rotate database credentials every 90 days
- Use automatic rotation where supported

See `secrets/secrets-manager-stub.js` for integration patterns.

## 3. Caching Layer

| Provider | Service | Minimum Specs |
|----------|---------|---------------|
| AWS | ElastiCache for Redis | cache.t3.small (1GB) |
| GCP | Memorystore for Redis | 1GB Basic tier |
| Azure | Azure Cache for Redis | C0 Standard |

### Use Cases
- Rate limiting storage (login attempts)
- Session/token blacklist cache
- API response caching for reports

## 4. Monitoring & Logging

### Application Performance Monitoring
- **Options:** DataDog, New Relic, or AWS CloudWatch
- Track: response times, error rates, throughput
- Set up dashboards for key business metrics

### Centralized Logging
- **Options:** ELK Stack (Elasticsearch, Logstash, Kibana) or cloud-native (CloudWatch Logs, Cloud Logging)
- Aggregate logs from all application containers
- Set retention to 30 days minimum

### Alerts
| Alert | Threshold | Severity |
|-------|-----------|----------|
| Failed login attempts | >10/min per IP | Warning |
| 5xx error rate | >1% of requests | Critical |
| Database connection errors | Any | Critical |
| API response latency P95 | >2s | Warning |
| CPU utilization | >80% for 5min | Warning |
| Memory utilization | >85% for 5min | Warning |

## 5. Container Orchestration

### Kubernetes (EKS/GKE/AKS) or ECS

| Component | Configuration |
|-----------|--------------|
| Min replicas | 2 |
| Max replicas | 10 |
| CPU request | 250m |
| CPU limit | 1000m |
| Memory request | 256Mi |
| Memory limit | 512Mi |
| Auto-scale trigger | CPU > 70% or Memory > 80% |

### Deployment Strategy
- Rolling deployments with zero downtime
- Health check endpoint: `GET /health`
- Readiness probe: HTTP GET /health, period 10s
- Liveness probe: HTTP GET /health, period 30s
- Graceful shutdown timeout: 30s

See `docker-compose.production.yml` for a production-like local setup.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_TYPE` | Database type: `postgres`, `mysql`, or `sqlite` | No (defaults to `sqlite`) |
| `DATABASE_URL` | Database connection string | Yes (for postgres/mysql) |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `PORT` | Application port | No (defaults to 3001) |
| `NODE_ENV` | Environment: `production`, `development` | Yes |
| `FRONTEND_URL` | Frontend origin for CORS | No |
