# 🔒 Security — FastMeals

Este documento descreve as práticas de segurança implementadas na plataforma FastMeals.

## Visão Geral

A segurança é implementada em múltiplas camadas: aplicação, infraestrutura, CI/CD e operações.

```
┌─────────────────────────────────────────────────────┐
│                    CI/CD Layer                       │
│  Trivy scan • npm audit • SonarCloud • SARIF/GitHub │
├─────────────────────────────────────────────────────┤
│                 Application Layer                    │
│  Helmet • CORS • Rate Limiting • JWT • Zod • bcrypt │
├─────────────────────────────────────────────────────┤
│               Infrastructure Layer                   │
│  VPC • Private subnets • Security Groups • ACM/TLS  │
├─────────────────────────────────────────────────────┤
│                 Data Layer                           │
│  RDS Encryption • Secrets Manager • Ansible Vault   │
└─────────────────────────────────────────────────────┘
```

---

## Application Security

### Authentication & Authorization

| Mecanismo | Implementação |
|-----------|--------------|
| **JWT Access Token** | 15 min expiration, HS256, shared secret via Secrets Manager |
| **JWT Refresh Token** | 7 days expiration, stored in Redis with revocation support |
| **Password Hashing** | bcrypt with 10 salt rounds |
| **Role-Based Access** | `admin` (full access) / `viewer` (read-only) via middleware |
| **Rate Limiting** | Per-IP rate limiting on all endpoints (configurable window/max) |

### HTTP Security Headers (Helmet)

Todos os 6 microserviços utilizam **Helmet.js** com a configuração padrão que inclui:

| Header | Valor | Proteção |
|--------|-------|----------|
| `X-Content-Type-Options` | nosniff | Previne MIME type sniffing |
| `X-Frame-Options` | SAMEORIGIN | Previne clickjacking |
| `X-XSS-Protection` | 0 | Desabilita filtro XSS legado (recomendação atual) |
| `Strict-Transport-Security` | max-age=15552000 | Força HTTPS |
| `X-DNS-Prefetch-Control` | off | Previne DNS prefetching |
| `X-Download-Options` | noopen | Previne execução de downloads no IE |
| `X-Permitted-Cross-Domain-Policies` | none | Bloqueia políticas cross-domain |
| `Referrer-Policy` | no-referrer | Controla envio do Referer header |
| `X-Powered-By` | (removido) | Oculta tecnologia do servidor |

### Input Validation

| Camada | Tecnologia | O que valida |
|--------|-----------|-------------|
| **Request body** | Zod schemas | Tipos, formatos, ranges em todos os endpoints |
| **URL params** | Zod + UUID validation | IDs válidos, paginação bounds |
| **Headers** | Express middleware | Authorization Bearer token format |
| **JSON body** | Express built-in | `express.json()` com rejeição de payloads malformados |

### CORS

```typescript
cors({
  origin: env.CORS_ORIGIN,  // Whitelisted origins only
  credentials: true,         // Allow cookies/auth headers
})
```

Em produção, `CORS_ORIGIN` é configurado para aceitar apenas `https://fastmeals.com.br` e subdomínios.

---

## Infrastructure Security

### Network Isolation

```
Internet
    │
    ▼
┌──────────────────────────────────────┐
│           Public Subnets              │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ Bastion   │  │ NAT Gateway     │  │
│  │ (SSH only)│  │ (outbound only) │  │
│  └──────────┘  └──────────────────┘  │
├──────────────────────────────────────┤
│          Private Subnets              │
│  ┌──────┐ ┌───────┐ ┌────────────┐  │
│  │ RDS  │ │ Redis │ │ RabbitMQ   │  │
│  │(5432)│ │(6379) │ │(5671 AMQPS)│  │
│  └──────┘ └───────┘ └────────────┘  │
│  ┌──────────────────────────────┐    │
│  │ Lambda Functions (23)        │    │
│  │ VPC-attached, private subnet │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### Security Groups

| Resource | Inbound Rules | Source |
|----------|--------------|--------|
| **RDS** | TCP 5432 | Lambda SG, Bastion SG only |
| **Redis** | TCP 6379 | Lambda SG, Bastion SG only |
| **RabbitMQ** | TCP 5671 (AMQPS) | Lambda SG only |
| **Bastion** | TCP 22 (SSH) | Admin IP only |
| **Lambda** | All outbound | Private subnet (NAT GW for internet) |

### Encryption

| Tipo | Implementação |
|------|--------------|
| **Data at rest** | RDS encryption enabled (AES-256) |
| **Data in transit** | TLS 1.2+ via ACM certificate (HTTPS) |
| **Secrets** | AWS Secrets Manager (9 secrets: DB passwords, JWT secrets, MQ credentials, Bedrock keys) |
| **Ansible** | Ansible Vault para credenciais nos playbooks |
| **Messaging** | AMQPS (TLS) para comunicação com Amazon MQ |

### API Gateway

| Configuração | Valor |
|-------------|-------|
| **Protocol** | HTTPS only (HTTP redirect) |
| **CORS** | Restricted origins |
| **Logging** | CloudWatch access logs enabled |
| **Throttling** | AWS default rate limiting |

---

## CI/CD Security

### Pipelines de Segurança

| Pipeline | Trigger | O que faz |
|----------|---------|-----------|
| **Security Scan** | push + weekly (Monday 6AM) | Trivy filesystem scan + npm audit all services |
| **SonarCloud** | push + PR | SAST, security hotspots, Quality Gate |
| **Trivy SARIF** | push | Upload results to GitHub Security tab |
| **Docker Scan** | merge to main | Trivy scan em Docker images (6 services) |

### Dependency Management

- `npm audit` em todos os 11 packages (6 backend + 5 frontend)
- Trivy filesystem scan para vulnerabilidades em dependencies
- SonarCloud security hotspot detection
- Weekly scheduled scan para detectar novas CVEs

### Secrets Management no CI/CD

| Secret | Storage |
|--------|---------|
| `SONAR_TOKEN` | GitHub Actions Secrets |
| `DD_API_KEY` | GitHub Actions Secrets → Terraform → Secrets Manager |
| AWS credentials | GitHub OIDC (recommended) or IAM user secrets |

---

## Security Checklist

- [x] JWT authentication with short-lived access tokens (15min)
- [x] Password hashing with bcrypt (10 rounds)
- [x] Rate limiting per IP on all endpoints
- [x] Helmet.js security headers on all services
- [x] CORS restricted to whitelisted origins
- [x] Input validation with Zod on all endpoints
- [x] RDS in private subnet (no public access)
- [x] Security groups with least privilege
- [x] RDS encryption at rest
- [x] TLS in transit (HTTPS, AMQPS)
- [x] Secrets in AWS Secrets Manager (not env vars or code)
- [x] Ansible Vault for operational credentials
- [x] Trivy vulnerability scanning in CI/CD
- [x] npm audit on all packages
- [x] SonarCloud SAST with Quality Gate
- [x] SARIF reports in GitHub Security tab
- [x] Weekly scheduled security scans
- [x] Graceful shutdown in all services
- [x] Structured logging (no sensitive data in logs)
- [x] Role-based access control (admin/viewer)

---

## Reporting Vulnerabilities

Se encontrar uma vulnerabilidade, por favor abra uma issue no repositório ou entre em contato via [LinkedIn](https://linkedin.com/in/vynnydev).