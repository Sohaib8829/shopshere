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
