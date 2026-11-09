# DevOps Cheatsheet

## Linux
- ls -l, cd, pwd, mkdir -p, cp, mv, rm, cat, nano
- sudo apt update / sudo apt install -y <pkg>
- chmod +x file (Permission denied ka hal)
- cat file | grep word

## Git (nizam: main mai seedha kaam nahi)
- git switch -c feature/<naam>
- git add . ; git commit -m "..." ; git push -u origin <branch>
- PR GitHub par, merge, phir: git switch main ; git pull ; git branch -d <branch>

## Docker
- docker build -t naam:1.0 .
- docker run -d --name x -p bahar:andar -e KEY=val image
- docker ps / ps -a / images / logs x / exec -it x bash / stop / rm

## Docker Compose
- docker compose up -d --build
- docker compose ps / logs -f <svc> / restart <svc>
- docker compose down   (data bachta hai)
- docker compose down -v  (DATA MIT JATA HAI)
- docker compose exec postgres psql -U <user> -d <db>

## Dockerfile ke 5 sawal
1 language 2 version 3 libraries kaise 4 start command 5 port

## Cache sabaq
- X-Cache HIT/MISS dekho (curl -i)
- Purani cache: TTL ka intezar ya flush_all
- Password badlo to volume ka purana data dhyan rakho

## Order flow (queue)
- order-service: DB mai save -> RabbitMQ mai message -> customer ko foran jawab
- notification-worker: queue se uthata hai, kaam, phir ack
- Worker band: parchiyan queue mai rukhi rehti hain (RabbitMQ page par Ready count)
- RabbitMQ web page: http://192.168.56.10:15672
- /health mai queue: connected/disconnected
- Worker jaisi service ka port nahi hota (koi use bulata nahi, wo khud queue se uthata hai)
- Python container mai print(..., flush=True) warna logs der se aate hain

## Frontend aur Nginx
- Multi-stage Dockerfile: build dabba (node) -> chhota final dabba (nginx), sirf dist jata hai
- Nginx reverse proxy: /api/products -> product-service, /api/orders -> order-service
- Nginx service ka address start par yaad karta hai: service wapas aaye aur 502 rahe to docker compose restart frontend
- React ki package-lock.json zaroori (npm ci ke liye); node_modules aur dist Git mai nahi
- Windows shared folder (/vagrant) mai npm install ka masla: VM ke asli folder mai build karo
- Store: http://192.168.56.10  |  RabbitMQ page: http://192.168.56.10:15672

## GitHub Actions (CI)
- Workflow file: .github/workflows/*.yml (spaces, tab nahi)
- on: kab chale | jobs: kaam | steps: chhote kaam | runs-on: nayi Ubuntu machine
- Runner khali hota hai: pehle uses: actions/checkout@v4
- matrix: aik job ko kai values par aik saath chalana
- needs: jobs ki tarteeb | if: failure() / always()
- Step fail = command ka exit code 0 nahi (grep -q se test banta hai)
- Asli passwords workflow mai nahi, GitHub Secrets mai

## AWS CLI aur Terraform
- aws configure (keys ~/.aws/credentials mai, kabhi Git ya chat mai nahi), aws sts get-caller-identity
- Tarteeb: terraform init -> fmt -> validate -> plan -> apply -> destroy
- Plan nishan: + banega, ~ badlega, - mitega, -/+ mit kar dobara banega (khatarnak)
- State (terraform.tfstate) = Terraform ki diary, Git mai nahi
- .terraform.lock.hcl Git mai jati hai, .terraform/ nahi
- Har session ke baad terraform destroy (bill bachao)
- Region: ap-south-1 (Mumbai)

## AWS network aur EC2 (Terraform)
- VPC = nijji network | public subnet = internet se milta hai | private = nahi (database yahan)
- Internet Gateway + Route Table (0.0.0.0/0) = public ka raasta
- Security Group = firewall: default mai sab band, jo kholo wahi khulta hai
- SSH sirf apne IP (/32) se; IP badle to timeout aayega -> tfvars theek karo + apply
- Key pair: .pub AWS ko, private key kabhi Git/chat mai nahi (~/.ssh mai)
- Ubuntu EC2 ka user: ubuntu
- "Container chal raha hai magar bahar se nahi khulta" -> Security Group dekho
- Aaj ke baad hamesha terraform destroy

## Ansible
- Terraform = ghar banata hai | Ansible = saman rakhta hai (agentless, SSH se)
- Inventory = servers ki list | Playbook = tasks ki YAML | Module = tayyar kaam (apt, file, service, user)
- ansible app -i inventory.ini -m ping | -a "uptime" | -m setup (facts)
- ansible-playbook -i inventory.ini docker.yml --check  (dry run, plan jaisa)
- become: true = sudo | state: present = "hona chahiye" (idempotent)
- Dobara chalao: changed=0 = sab theek
- inventory.ini mai IP badalta hai, Git mai nahi; terraform output -raw app_public_ip se banao

## ECR (Docker images ka godam)
- Registry = godam, Repository = aik service ka khana, Tag = version
- Aarzi cheezein (EC2) infra/terraform mai, mustaqil (ECR) infra/ecr mai, alag state
- for_each = aik block se kai resources
- Login: aws ecr get-login-password --region R | docker login --username AWS --password-stdin REGISTRY
- Image naam: <registry>/shopsphere/<service>:<tag>
- docker build -t NAAM . ; docker push NAAM ; docker pull NAAM
- IMMUTABLE tag: aik baar bana to dobara overwrite nahi (naya tag do)
- scan_on_push: base image ki vulnerabilities dekho, lifecycle policy: sirf aakhri 10 images
- latest tag ki jagah hamesha pakka tag (git sha)

## OIDC (CI se AWS, bina chabi ke)
- IAM User = lambi umar ki chabi | IAM Role = aarzi pass (topi)
- OIDC: GitHub apna card (token) dikhata hai, AWS verify karke role ka aarzi pass deta hai
- Trust policy = kaun role pehen sakta hai (repo + branch ki shart)
- Permission policy = role kya kar sakta hai (sirf hamari ECR repos ka push)
- Workflow mai: permissions: id-token: write + configure-aws-credentials (role-to-assume)
- GitHub mai sirf Variables (AWS_ROLE_ARN, AWS_REGION), koi secret nahi
- Image tag = git commit hash (7 harf), latest nahi
- Images sirf main se, smoke-test pass hone ke baad
- Kaam ke baad IAMFullAccess hata do (least privilege)

## OIDC masla (sub claim)
- Error "Not authorized to perform sts:AssumeRoleWithWebIdentity" = trust policy ki shart mel nahi khayi
- Andaza mat lagao: workflow se asli claims print karo (sub, aud, repository, ref)
- GitHub ka naya sub format: repo:OWNER@OWNERID/REPO@REPOID:ref:refs/heads/main (numeric IDs shamil)
- Policy mai IDs exact rakho (wildcard nahi), IDs secret nahi
- Policy badalne ke baad naya commit zaroori nahi, failed job re-run karo
- IAMFullAccess sirf aarzi, kaam ke baad hata do

## RDS, ElastiCache, EC2 role
- RDS = managed Postgres, ElastiCache = managed cache, dono private subnets mai (publicly_accessible = false)
- DB subnet group = kam az kam 2 zones ke subnets
- SG se SG ka rasta: security_groups = [app-sg] (IP nahi)
- random_password: password code mai nahi, state mai (state Git mai nahi)
- EC2 IAM role + instance profile: server par koi key nahi (169.254.169.254 se identity)
- Private test: VM se nc timeout, EC2 se succeeded
- RDS ab SSL maangta hai (sslmode=require), app mai ssl setting chahiye
- Kharcha: RDS, ElastiCache, EC2 ghante ke hisaab se, session ke baad terraform destroy
- Backup: aaj 0 din (seekhne ke liye), asli mai 7+ din, deletion_protection = true

## Deploy (Ansible + ECR + RDS)
- Production compose: image: ECR/...:tag (build nahi), sirf frontend ka port 80, restart: unless-stopped
- Node pg + RDS: ssl chahiye (DB_SSL=true); Python psycopg: PGSSLMODE=require
- Secrets: ~/.shopsphere/ (repo ke bahar), server par .env mode 0600, no_log: true
- EC2 ko ECR ki ijazat role se: aws ecr get-login-password | docker login (koi key nahi)
- Rollback = purana image tag: bash scripts/prepare-deploy.sh <tag> phir deploy.yml
- Roz ka tareeqa: terraform apply -> prepare-deploy.sh -> docker.yml -> deploy.yml
- docker kill container: restart policy khud uthati hai; reboot ke baad bhi stack wapas
