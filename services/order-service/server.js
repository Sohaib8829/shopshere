const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const orders = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/orders", (req, res) => {
  res.json(orders);
});

app.post("/orders", (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ detail: "customer and items are required" });
  }

  const order = { id: nextId++, customer, items, status: "created" };
  orders.push(order);
  res.status(201).json(order);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`order-service listening on port ${PORT}`);
});
