#!/usr/bin/env bash
# Writes the Ansible inventory and the deploy variables from Terraform outputs.
# Usage: bash scripts/prepare-deploy.sh [image_tag]
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/.." && pwd)
VARS_DIR="$HOME/.shopsphere"
mkdir -p "$VARS_DIR"

git -C "$ROOT" fetch -q origin
REGISTRY=$(terraform -chdir="$ROOT/infra/ecr" output -raw registry)
REGION=$(echo "$REGISTRY" | cut -d. -f4)
TAG=${1:-$(git -C "$ROOT" rev-parse --short=7 origin/main)}

for svc in frontend product-service order-service notification-worker; do
  if ! aws ecr describe-images --region "$REGION" --repository-name "shopsphere/$svc" --image-ids imageTag="$TAG" > /dev/null 2>&1; then
    echo "Image shopsphere/$svc:$TAG is not in ECR yet. Did the CI publish job finish?"
    exit 1
  fi
done

EC2_IP=$(terraform -chdir="$ROOT/infra/terraform" output -raw app_public_ip)

cat > "$ROOT/infra/ansible/inventory.ini" << EOF
[app]
shopsphere-app ansible_host=${EC2_IP}

[app:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/shopsphere-aws
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOF

umask 077
cat > "$VARS_DIR/deploy-vars.yml" << EOF
ecr_registry: ${REGISTRY}
image_tag: "${TAG}"
db_host: $(terraform -chdir="$ROOT/infra/terraform" output -raw db_endpoint)
db_password: "$(terraform -chdir="$ROOT/infra/terraform" output -raw db_password)"
cache_host: $(terraform -chdir="$ROOT/infra/terraform" output -raw cache_endpoint)
EOF

echo "Ready: server ${EC2_IP}, image tag ${TAG}"
