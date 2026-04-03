#!/usr/bin/env bash
# ============================================
# FastMeals — Developer Environment Setup
# Installs all required tools for the project
# ============================================
# Usage:
#   ./scripts/setup-dev-environment.sh          # Install all
#   ./scripts/setup-dev-environment.sh --check  # Just check what's installed
# ============================================
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECK_ONLY="${1:-}"
MISSING=()

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║  🍔 FastMeals — Dev Environment Setup  ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# ========================================
# Helper functions
# ========================================
check_tool() {
  local name="$1"
  local cmd="$2"
  local version_flag="${3:---version}"
  local install_info="$4"

  if command -v "$cmd" &> /dev/null; then
    local version
    version=$($cmd $version_flag 2>&1 | head -1)
    echo -e "  ${GREEN}✅ $name${NC} — $version"
    return 0
  else
    echo -e "  ${RED}❌ $name${NC} — not installed ($install_info)"
    MISSING+=("$name")
    return 1
  fi
}

install_brew_package() {
  local name="$1"
  local package="${2:-$1}"

  if [ "$CHECK_ONLY" = "--check" ]; then
    return
  fi

  if ! command -v "$name" &> /dev/null; then
    echo -e "  ${YELLOW}📦 Installing $name...${NC}"
    brew install "$package" 2>/dev/null || echo -e "  ${RED}Failed to install $name${NC}"
  fi
}

# ========================================
# Check OS
# ========================================
echo -e "${BLUE}System:${NC}"
OS="$(uname -s)"
ARCH="$(uname -m)"
echo -e "  OS: $OS ($ARCH)"

if [ "$OS" = "Darwin" ]; then
  echo -e "  ${GREEN}✅ macOS detected${NC}"
elif [ "$OS" = "Linux" ]; then
  echo -e "  ${GREEN}✅ Linux detected${NC}"
else
  echo -e "  ${YELLOW}⚠️  Unsupported OS — some installations may fail${NC}"
fi

# ========================================
# Check Homebrew (macOS)
# ========================================
if [ "$OS" = "Darwin" ]; then
  echo ""
  echo -e "${BLUE}Package Manager:${NC}"
  if command -v brew &> /dev/null; then
    echo -e "  ${GREEN}✅ Homebrew${NC} — $(brew --version | head -1)"
  else
    echo -e "  ${RED}❌ Homebrew${NC} — not installed"
    if [ "$CHECK_ONLY" != "--check" ]; then
      echo -e "  ${YELLOW}📦 Installing Homebrew...${NC}"
      /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
  fi
fi

# ========================================
# Core Tools
# ========================================
echo ""
echo -e "${BLUE}Core Tools:${NC}"
check_tool "Node.js"       "node"       "--version" "https://nodejs.org"
check_tool "npm"           "npm"        "--version" "comes with Node.js"
check_tool "Git"           "git"        "--version" "brew install git"
check_tool "Docker"        "docker"     "--version" "https://docker.com/desktop"
check_tool "Docker Compose" "docker"    "compose version" "comes with Docker Desktop"

# ========================================
# Infrastructure Tools
# ========================================
echo ""
echo -e "${BLUE}Infrastructure:${NC}"
check_tool "Terraform"     "terraform"  "--version" "brew install terraform"
check_tool "AWS CLI"       "aws"        "--version" "brew install awscli"
check_tool "Ansible"       "ansible"    "--version" "brew install ansible"
check_tool "Infracost"     "infracost"  "--version" "brew install infracost"

# ========================================
# Testing Tools
# ========================================
echo ""
echo -e "${BLUE}Testing:${NC}"
check_tool "Playwright"    "npx"        "playwright --version" "npm install -g playwright"

# ========================================
# Optional Tools
# ========================================
echo ""
echo -e "${BLUE}Optional:${NC}"
check_tool "jq"            "jq"         "--version" "brew install jq"
check_tool "psql"          "psql"       "--version" "brew install postgresql@16"
check_tool "redis-cli"     "redis-cli"  "--version" "brew install redis"

# ========================================
# Install missing tools (macOS only)
# ========================================
if [ "$CHECK_ONLY" != "--check" ] && [ "$OS" = "Darwin" ] && [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}Installing missing tools...${NC}"

  for tool in "${MISSING[@]}"; do
    case "$tool" in
      "Node.js")       install_brew_package "node" "node@20" ;;
      "Git")           install_brew_package "git" ;;
      "Terraform")     install_brew_package "terraform" "hashicorp/tap/terraform" ;;
      "AWS CLI")       install_brew_package "aws" "awscli" ;;
      "Ansible")       install_brew_package "ansible" ;;
      "Infracost")     install_brew_package "infracost" "infracost/infracost/infracost" ;;
      "jq")            install_brew_package "jq" ;;
      "psql")          install_brew_package "psql" "postgresql@16" ;;
      "redis-cli")     install_brew_package "redis-cli" "redis" ;;
      "Docker")        echo -e "  ${YELLOW}⚠️  Docker Desktop must be installed manually: https://docker.com/desktop${NC}" ;;
      *)               echo -e "  ${YELLOW}⚠️  $tool — install manually${NC}" ;;
    esac
  done
fi

# ========================================
# Verify SSH Key
# ========================================
echo ""
echo -e "${BLUE}SSH Keys:${NC}"
if [ -f "$HOME/.ssh/fastmeals-bastion.pem" ]; then
  echo -e "  ${GREEN}✅ fastmeals-bastion.pem${NC} — found"
else
  echo -e "  ${YELLOW}⚠️  fastmeals-bastion.pem${NC} — not found in ~/.ssh/ (needed for Ansible)"
fi

# ========================================
# Verify Infracost Auth
# ========================================
echo ""
echo -e "${BLUE}Authentication:${NC}"
if command -v infracost &> /dev/null; then
  if infracost configure get api_key &> /dev/null; then
    echo -e "  ${GREEN}✅ Infracost${NC} — authenticated"
  else
    echo -e "  ${YELLOW}⚠️  Infracost${NC} — not authenticated (run: infracost auth login)"
  fi
else
  echo -e "  ${YELLOW}⏭️  Infracost${NC} — skipped (not installed)"
fi

if command -v aws &> /dev/null; then
  if aws sts get-caller-identity &> /dev/null 2>&1; then
    local_account=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null)
    echo -e "  ${GREEN}✅ AWS CLI${NC} — authenticated (account: $local_account)"
  else
    echo -e "  ${YELLOW}⚠️  AWS CLI${NC} — not authenticated (run: aws configure)"
  fi
else
  echo -e "  ${YELLOW}⏭️  AWS CLI${NC} — skipped (not installed)"
fi

# ========================================
# Summary
# ========================================
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
if [ ${#MISSING[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ All tools installed! Environment is ready.${NC}"
else
  echo -e "${YELLOW}⚠️  Missing ${#MISSING[@]} tool(s): ${MISSING[*]}${NC}"
  if [ "$CHECK_ONLY" = "--check" ]; then
    echo -e "Run without --check to install missing tools."
  fi
fi
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. docker compose up --build -d"
echo "  2. ./scripts/prepare-services-linux-mac.sh"
echo "  3. Open http://localhost:5000"
echo ""