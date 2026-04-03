# 🤖 FastMeals — Ansible Automation

Playbooks para automação operacional do FastMeals via **Bastion Host**. Gerencia migrations, seeds, health checks, manutenção de banco, backups para S3 e disaster recovery.

---

## 📑 Índice

1. [Arquitetura](#-arquitetura)
2. [Pré-requisitos](#-pré-requisitos)
3. [Setup Inicial](#-setup-inicial)
4. [Playbooks](#-playbooks)
5. [Wrapper Scripts](#-wrapper-scripts)
6. [Exemplos de Uso](#-exemplos-de-uso)
7. [Ansible Vault](#-ansible-vault)
8. [Alterações no Terraform](#-alterações-no-terraform)
9. [Estrutura de Arquivos](#-estrutura-de-arquivos)

---

## 🏗 Arquitetura

```
Sua máquina (Ansible Controller)
        │
        │ SSH (porta 22)
        ▼
  ┌─────────────┐      ┌──────────────┐
  │   Bastion    │─────▶│   RDS        │
  │   EC2        │ 5432 │  PostgreSQL  │
  │  (pública)   │      │  (privada)   │
  └──────┬───────┘      └──────────────┘
         │
         ├─────▶ Redis (6379)
         ├─────▶ RabbitMQ (5671)
         └─────▶ S3 (backups)
```

O Ansible roda **localmente** e executa os comandos **remotamente no Bastion** via SSH. O Bastion já tem acesso à rede privada da VPC (RDS, Redis, Amazon MQ), servindo como jump host para todas as operações.

---

## ✅ Pré-requisitos

**Na sua máquina (controller):**

```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt install ansible

# Verificar
ansible --version  # >= 2.15
```

**Chave SSH do Bastion:**

```bash
# A key pair fastmeals-bastion.pem deve estar em ~/.ssh/
chmod 400 ~/.ssh/fastmeals-bastion.pem
```

---

## 🚀 Setup Inicial

### 1. Configurar secrets com Ansible Vault

```bash
cd infrastructure/ansible

# Copiar template de secrets
cp group_vars/secrets.yml.example group_vars/secrets.yml

# Editar com suas credenciais reais
nano group_vars/secrets.yml

# Encriptar o arquivo
ansible-vault encrypt group_vars/secrets.yml
# Será pedida uma senha — guarde-a com segurança

# Salvar a senha do vault (para não digitar toda vez)
echo "SUA_SENHA_VAULT" > .vault_password
chmod 600 .vault_password
```

### 2. Testar conectividade com o Bastion

```bash
# Ping
ansible bastion -m ping

# Resultado esperado:
# fastmeals-bastion | SUCCESS => { "ping": "pong" }
```

### 3. Preparar o Bastion (rodar uma vez)

```bash
ansible-playbook playbooks/setup.yml
```

Isso instala no Bastion: Node.js 20, Prisma CLI, AWS CLI v2, e clona o repositório.

---

## 📋 Playbooks

### `setup.yml` — Preparação do Bastion

Instala todas as dependências no Bastion e cria o bucket S3 para backups.

```bash
ansible-playbook playbooks/setup.yml
```

### `migrations.yml` — Prisma Migrations

Roda `prisma migrate deploy` nos 5 bancos de dados via Bastion.

```bash
# Todos os bancos
ansible-playbook playbooks/migrations.yml

# Apenas um serviço
ansible-playbook playbooks/migrations.yml -e "target_service=orders-service"

# Dry run (apenas mostra status)
ansible-playbook playbooks/migrations.yml -e "dry_run=true"
```

### `seed.yml` — Popular Bancos

Executa `prisma db seed` em cada serviço.

```bash
# Todos os bancos
ansible-playbook playbooks/seed.yml

# Apenas um serviço
ansible-playbook playbooks/seed.yml -e "target_service=auth-service"

# Reset + seed (DROP + CREATE + SEED)
ansible-playbook playbooks/seed.yml -e "reset_before_seed=true"
```

### `health-check.yml` — Verificação de Infraestrutura

Verifica RDS (5 databases), Redis, API Gateway, Lambda endpoints e Bastion.

```bash
# Verificação completa
ansible-playbook playbooks/health-check.yml

# Apenas banco de dados
ansible-playbook playbooks/health-check.yml --tags database

# Apenas API/Lambda
ansible-playbook playbooks/health-check.yml --tags api

# Apenas Bastion
ansible-playbook playbooks/health-check.yml --tags bastion
```

**Tags disponíveis:** `database`, `rds`, `cache`, `redis`, `api`, `lambda`, `bastion`

### `maintenance.yml` — Manutenção de Banco

VACUUM ANALYZE, REINDEX, limpeza de conexões idle e backups antigos.

```bash
# Manutenção completa
ansible-playbook playbooks/maintenance.yml

# Apenas vacuum
ansible-playbook playbooks/maintenance.yml --tags vacuum

# Apenas limpeza
ansible-playbook playbooks/maintenance.yml --tags cleanup

# Apenas estatísticas
ansible-playbook playbooks/maintenance.yml --tags stats
```

**Tags disponíveis:** `vacuum`, `reindex`, `stats`, `connections`, `cleanup`, `bastion`

### `backup.yml` — Backup para S3

`pg_dump` comprimido dos 5 bancos → upload para S3 com lifecycle de 7 dias.

```bash
# Todos os bancos
ansible-playbook playbooks/backup.yml

# Apenas um banco
ansible-playbook playbooks/backup.yml -e "target_db=orders_db"

# Com tag customizada (ex: antes de migration)
ansible-playbook playbooks/backup.yml -e "backup_tag=pre-migration"
```

**Destino S3:** `s3://fastmeals-db-backups/backups/{timestamp}-{tag}/`

### `disaster-recovery.yml` — Restore de Backups

Restaura bancos a partir do backup mais recente no S3 (ou de um backup específico).

```bash
# Restore do backup mais recente (TODOS os bancos)
ansible-playbook playbooks/disaster-recovery.yml

# Apenas um banco
ansible-playbook playbooks/disaster-recovery.yml -e "target_db=orders_db"

# De um backup específico
ansible-playbook playbooks/disaster-recovery.yml \
  -e "restore_prefix=backups/20260401T120000-scheduled"

# Skip confirmação (para CI/CD)
ansible-playbook playbooks/disaster-recovery.yml -e "skip_confirm=true"
```

> ⚠️ **CUIDADO:** O disaster recovery faz DROP + CREATE dos bancos! O playbook pede confirmação manual (digitar "RESTORE") antes de executar.

---

## 🔧 Wrapper Scripts

Para execução rápida sem lembrar a sintaxe do `ansible-playbook`:

```bash
# Migrations
./scripts/run-migrations.sh                      # Todos
./scripts/run-migrations.sh auth-service         # Apenas auth
./scripts/run-migrations.sh "" --dry-run         # Dry run

# Seeds
./scripts/run-seeds.sh                           # Todos
./scripts/run-seeds.sh products-service          # Apenas products
./scripts/run-seeds.sh "" --reset                # Reset + seed

# Health Check
./scripts/run-health-check.sh                    # Completo
./scripts/run-health-check.sh database           # Apenas DB

# Backup
./scripts/run-backup.sh                          # Todos
./scripts/run-backup.sh orders_db pre-migration  # Um banco + tag

# Maintenance
./scripts/run-maintenance.sh                     # Completo
./scripts/run-maintenance.sh vacuum              # Apenas vacuum

# Disaster Recovery
./scripts/run-disaster-recovery.sh               # Restore latest
./scripts/run-disaster-recovery.sh orders_db     # Um banco
```

---

## 💡 Exemplos de Uso

### Fluxo típico de deploy

```bash
# 1. Backup antes de qualquer mudança
./scripts/run-backup.sh "" pre-deploy

# 2. Rodar migrations
./scripts/run-migrations.sh

# 3. Verificar saúde
./scripts/run-health-check.sh

# 4. Se algo deu errado → rollback
./scripts/run-disaster-recovery.sh
```

### Manutenção semanal

```bash
# 1. Health check
./scripts/run-health-check.sh

# 2. Backup
./scripts/run-backup.sh "" weekly

# 3. Manutenção (vacuum + reindex + cleanup)
./scripts/run-maintenance.sh
```

### Reset de ambiente (staging/testing)

```bash
# Reset completo: drop + migrate + seed
./scripts/run-seeds.sh "" --reset
```

---

## 🔐 Ansible Vault

As credenciais de banco são armazenadas encriptadas com `ansible-vault`.

```bash
# Editar secrets
ansible-vault edit group_vars/secrets.yml

# Visualizar secrets (descriptografado)
ansible-vault view group_vars/secrets.yml

# Trocar senha do vault
ansible-vault rekey group_vars/secrets.yml

# Rodar playbook sem .vault_password file
ansible-playbook playbooks/migrations.yml --ask-vault-pass
```

**Secrets armazenados:**

| Secret | Usado por |
|--------|-----------|
| `vault_auth_db_password` | migrations, seed, backup, restore |
| `vault_products_db_password` | migrations, seed, backup, restore |
| `vault_orders_db_password` | migrations, seed, backup, restore |
| `vault_delivery_db_password` | migrations, seed, backup, restore |
| `vault_reports_db_password` | migrations, seed, backup, restore |
| `vault_rds_master_password` | disaster-recovery (CREATE DATABASE) |
| `vault_mq_user` / `vault_mq_password` | health-check |
| `vault_jwt_access_secret` | seed (auth-service) |

---

## 🏗 Alterações no Terraform

O módulo `bastion` foi atualizado com:

**`main.tf` — Mudanças:**

| Antes | Depois |
|-------|--------|
| Volume 8GB gp3 | Volume **20GB** gp3 (espaço para Node.js + backups) |
| Apenas `psql` e `redis-cli` | + **Node.js 20**, **Prisma CLI**, **AWS CLI v2**, **git**, **jq** |
| Apenas `AmazonSSMManagedInstanceCore` | + **S3 backup policy** + **Secrets Manager read** |
| 1 helper script | 2 helper scripts (`connect-rds.sh` + `health-check.sh`) |
| Sem tags de automação | Tags: `ManagedBy=terraform`, `AnsibleRole=bastion` |

**`variables.tf` — Novas variáveis:**

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `redis_endpoint` | string | Endpoint do Redis (para health check scripts) |
| `api_gateway_url` | string | URL do API Gateway (para health check scripts) |
| `aws_region` | string | Região AWS (para IAM policies) |

**IAM Policies adicionadas:**

- `s3:PutObject/GetObject/DeleteObject/ListBucket` no bucket `fastmeals-db-backups`
- `s3:CreateBucket/PutBucketVersioning/PutLifecycleConfiguration` no bucket de backups
- `secretsmanager:GetSecretValue/DescribeSecret` nos secrets `fastmeals/*`

---

## 📁 Estrutura de Arquivos

```
infrastructure/ansible/
├── ansible.cfg                              # Configuração global do Ansible (SSH user, key, timeout, vault)
├── .gitignore                               # Ignora secrets, vault password e chaves SSH
├── README.md                                # Documentação completa do Ansible (setup, playbooks, exemplos)
│
├── inventory/
│   └── aws.yml                              # Inventário com o Bastion Host (IP, SSH user, key path)
│
├── group_vars/
│   ├── bastion.yml                          # Variáveis: endpoints RDS/Redis/MQ, definição dos 5 DBs, config de backup
│   └── secrets.yml.example                  # Template para credenciais (encriptar com ansible-vault)
│
├── roles/
│   └── bastion-setup/
│       └── tasks/
│           └── main.yml                     # Role: instala Node.js 20, Prisma CLI, AWS CLI v2, clona repo, cria bucket S3
│
├── playbooks/
│   ├── setup.yml                            # Prepara o Bastion Host (executa a role bastion-setup + testa conectividade RDS)
│   ├── migrations.yml                       # Orquestra Prisma migrate deploy nos 5 bancos (suporta target único e dry run)
│   ├── seed.yml                             # Orquestra Prisma db seed nos 5 bancos (suporta reset antes do seed)
│   ├── health-check.yml                     # Verifica RDS (5 DBs), Redis, API Gateway, Lambda endpoints e disco do Bastion
│   ├── maintenance.yml                      # VACUUM ANALYZE, REINDEX, kill idle connections, limpeza de backups antigos
│   ├── backup.yml                           # Orquestra pg_dump dos 5 bancos → comprime → upload S3 com lifecycle 7 dias
│   ├── disaster-recovery.yml                # Restore do S3: download backup, DROP + CREATE database, pg_restore com confirmação
│   └── tasks/
│       ├── migrate-single-db.yml            # Task reutilizável: npm ci + prisma generate + prisma migrate deploy em 1 banco
│       ├── seed-single-db.yml               # Task reutilizável: npm ci + prisma generate + prisma db seed em 1 banco
│       ├── backup-single-db.yml             # Task reutilizável: pg_dump + gzip de 1 banco com report de tamanho
│       └── restore-single-db.yml            # Task reutilizável: decompress + DROP + CREATE + psql restore de 1 banco
│
└── scripts/
    ├── run-migrations.sh                    # Wrapper: execução rápida de migrations (aceita service e --dry-run)
    ├── run-seeds.sh                         # Wrapper: execução rápida de seeds (aceita service e --reset)
    ├── run-health-check.sh                  # Wrapper: execução rápida de health check (aceita tag: database, api, bastion)
    ├── run-backup.sh                        # Wrapper: execução rápida de backup (aceita database e tag customizada)
    ├── run-maintenance.sh                   # Wrapper: execução rápida de manutenção (aceita tag: vacuum, cleanup, stats)
    └── run-disaster-recovery.sh             # Wrapper: execução rápida de disaster recovery (aceita database e S3 prefix)
```

---

*Parte do projeto [FastMeals](https://github.com/vynnydev/fastmeals) — Full Stack & DevOps*