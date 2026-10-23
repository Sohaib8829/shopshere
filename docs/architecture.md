# Architecture

User -> Nginx -> Frontend
Frontend -> product-service -> Memcached -> PostgreSQL
Frontend -> order-service -> PostgreSQL
order-service -> RabbitMQ -> notification-worker
