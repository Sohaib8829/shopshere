const express = require("express");
const { Pool } = require("pg");
const amqp = require("amqplib");

const PORT = process.env.PORT || 3000;
const QUEUE = process.env.QUEUE_NAME || "order_created";
const RABBIT_URL = process.env.RABBIT_URL || "amqp://localhost";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "shopsphere",
  user: process.env.DB_USER || "shopsphere",
  password: process.env.DB_PASSWORD || "",
});

let channel = null;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectRabbit() {
  for (let attempt = 1; ; attempt++) {
    try {
      const conn = await amqp.connect(RABBIT_URL);
      conn.on("error", (err) => console.error("rabbitmq error:", err.message));
      conn.on("close", () => {
        console.error("rabbitmq connection closed, reconnecting...");
        channel = null;
        connectRabbit();
      });
      const ch = await conn.createChannel();
      await ch.assertQueue(QUEUE, { durable: true });
      channel = ch;
      console.log("connected to rabbitmq");
      return;
    } catch (err) {
      console.error(`rabbitmq connect failed (attempt ${attempt}): ${err.message}`);
      await sleep(3000);
    }
  }
}

async function initDb() {
  for (let attempt = 1; ; attempt++) {
    try {
      await pool.query(
        "CREATE TABLE IF NOT EXISTS orders (" +
          "id SERIAL PRIMARY KEY, customer TEXT NOT NULL, items JSONB NOT NULL, " +
          "status TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())"
      );
      console.log("database ready");
      return;
    } catch (err) {
      console.error(`database not ready (attempt ${attempt}): ${err.message}`);
      await sleep(3000);
    }
  }
}

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", queue: channel ? "connected" : "disconnected" });
});

app.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, customer, items, status, created_at FROM orders ORDER BY id DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("list orders failed:", err.message);
    res.status(500).json({ detail: "could not fetch orders" });
  }
});

app.post("/orders", async (req, res) => {
  const { customer, items } = req.body;

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ detail: "customer and items are required" });
  }
  if (!channel) {
    return res.status(503).json({ detail: "message queue unavailable, try again" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO orders (customer, items, status) VALUES ($1, $2, 'created') " +
        "RETURNING id, customer, items, status, created_at",
      [customer, JSON.stringify(items)]
    );
    const order = result.rows[0];

    channel.sendToQueue(
      QUEUE,
      Buffer.from(JSON.stringify({ orderId: order.id, customer: order.customer })),
      { persistent: true }
    );

    res.status(201).json(order);
  } catch (err) {
    console.error("create order failed:", err.message);
    res.status(500).json({ detail: "could not create order" });
  }
});

async function start() {
  await initDb();
  connectRabbit();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`order-service listening on port ${PORT}`);
  });
}

start();
