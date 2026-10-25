import json
import os
import time

import pika

RABBIT_URL = os.getenv("RABBIT_URL", "amqp://guest:guest@localhost:5672/")
QUEUE = os.getenv("QUEUE_NAME", "order_created")


def connect():
    while True:
        try:
            return pika.BlockingConnection(pika.URLParameters(RABBIT_URL))
        except Exception as err:
            print(f"rabbitmq not ready: {err}. retrying in 3s", flush=True)
            time.sleep(3)


def handle(channel, method, properties, body):
    order = json.loads(body)
    print(f"preparing confirmation for order #{order['orderId']} ({order['customer']})", flush=True)
    time.sleep(2)  # email bhejne ka kaam (nakli)
    print(f"confirmation sent to {order['customer']} for order #{order['orderId']}", flush=True)
    channel.basic_ack(delivery_tag=method.delivery_tag)


def main():
    while True:
        try:
            connection = connect()
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE, durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=QUEUE, on_message_callback=handle)
            print("worker waiting for messages", flush=True)
            channel.start_consuming()
        except Exception as err:
            print(f"worker error: {err}. reconnecting in 3s", flush=True)
            time.sleep(3)


if __name__ == "__main__":
    main()
