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
