from fastapi import FastAPI, HTTPException

app = FastAPI(title="ShopSphere Product Service")

PRODUCTS = [
    {"id": 1, "name": "T-Shirt", "price": 1500},
    {"id": 2, "name": "Shoes", "price": 4500},
    {"id": 3, "name": "Cap", "price": 800},
]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/products")
def list_products():
    return PRODUCTS


@app.get("/products/{product_id}")
def get_product(product_id: int):
    for product in PRODUCTS:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")
