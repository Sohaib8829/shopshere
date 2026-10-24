import json
import os
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI, HTTPException, Response
from pymemcache.client.base import Client

# Saari settings environment variables se aati hain (DevOps deta hai)
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "dbname": os.getenv("DB_NAME", "shopsphere"),
    "user": os.getenv("DB_USER", "shopsphere"),
    "password": os.getenv("DB_PASSWORD", ""),
}
CACHE_HOST = os.getenv("CACHE_HOST", "localhost")
CACHE_PORT = int(os.getenv("CACHE_PORT", "11211"))
CACHE_TTL = int(os.getenv("CACHE_TTL", "60"))

cache = Client((CACHE_HOST, CACHE_PORT), connect_timeout=1, timeout=1)

SEED = [("T-Shirt", 1500), ("Shoes", 4500), ("Cap", 800)]


def get_conn():
    return psycopg.connect(**DB_CONFIG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Service start hote hi table banao aur pehli baar products daalo
    with get_conn() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS products ("
            "id SERIAL PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL)"
        )
        count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if count == 0:
            for name, price in SEED:
                conn.execute(
                    "INSERT INTO products (name, price) VALUES (%s, %s)",
                    (name, price),
                )
    yield


app = FastAPI(title="ShopSphere Product Service", lifespan=lifespan)


def fetch_products():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, name, price FROM products ORDER BY id"
        ).fetchall()
    return [{"id": r[0], "name": r[1], "price": r[2]} for r in rows]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/products")
def list_products(response: Response):
    try:
        cached = cache.get("products:all")
    except Exception:
        cached = None

    if cached:
        response.headers["X-Cache"] = "HIT"
        return json.loads(cached)

    products = fetch_products()
    try:
        cache.set("products:all", json.dumps(products).encode(), expire=CACHE_TTL)
    except Exception:
        pass
    response.headers["X-Cache"] = "MISS"
    return products


@app.get("/products/{product_id}")
def get_product(product_id: int):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, name, price FROM products WHERE id = %s", (product_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"id": row[0], "name": row[1], "price": row[2]}
