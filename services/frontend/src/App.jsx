import { useEffect, useMemo, useState } from "react";

const ICONS = { "t-shirt": "👕", shoes: "👟", cap: "🧢", jacket: "🧥", watch: "⌚" };
const iconFor = (name) => ICONS[name.toLowerCase()] || "🛍️";
const money = (n) => `Rs ${Number(n).toLocaleString("en-PK")}`;

export default function App() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [placing, setPlacing] = useState(false);
  const [notice, setNotice] = useState("");
  const [placed, setPlaced] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersError, setOrdersError] = useState("");

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("bad status");
      setProducts(await res.json());
    } catch {
      setError("We could not load the products. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setOrdersError("");
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("bad status");
      setOrders(await res.json());
    } catch {
      setOrdersError("We could not load your orders right now.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (view === "orders") loadOrders();
  }, [view]);

  const cartItems = useMemo(
    () => products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] })),
    [products, cart]
  );
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const visible = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const change = (id, delta) =>
    setCart((c) => {
      const q = (c[id] || 0) + delta;
      const next = { ...c };
      if (q <= 0) delete next[id];
      else next[id] = q;
      return next;
    });

  async function placeOrder(e) {
    e.preventDefault();
    setPlacing(true);
    setNotice("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: customer.trim(),
          items: cartItems.map((i) => ({ productId: i.id, qty: i.qty })),
        }),
      });
      if (!res.ok) throw new Error("bad status");
      setPlaced(await res.json());
      setCart({});
      setCustomer("");
      setCartOpen(false);
    } catch {
      setNotice("We could not place your order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">🛍️ ShopSphere</div>
        <nav>
          <button className={`link ${view === "shop" ? "active" : ""}`} onClick={() => setView("shop")}>
            Shop
          </button>
          <button className={`link ${view === "orders" ? "active" : ""}`} onClick={() => setView("orders")}>
            My Orders
          </button>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            🛒 Cart <span className="badge">{count}</span>
          </button>
        </nav>
      </header>

      {placed && (
        <div className="success">
          <div>
            <strong>Order #{placed.id} confirmed!</strong> Thank you, {placed.customer}. A confirmation is on its way.
          </div>
          <button className="link" onClick={() => setPlaced(null)}>Dismiss</button>
        </div>
      )}

      {view === "shop" && (
        <main className="page">
          <section className="hero">
            <h1>Fresh styles, delivered fast.</h1>
            <p>Pick your favourites, add them to the cart and check out in seconds.</p>
          </section>

          <div className="toolbar">
            <h2>Products</h2>
            <input
              className="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <p className="muted">Loading products...</p>}
          {error && (
            <div className="error">
              {error} <button className="link" onClick={loadProducts}>Retry</button>
            </div>
          )}
          {!loading && !error && visible.length === 0 && <p className="muted">No products found.</p>}

          <div className="grid">
            {visible.map((p) => (
              <article className="card" key={p.id}>
                <div className="thumb">{iconFor(p.name)}</div>
                <h3>{p.name}</h3>
                <div className="price">{money(p.price)}</div>
                <button className="btn" onClick={() => change(p.id, 1)}>Add to cart</button>
              </article>
            ))}
          </div>
        </main>
      )}

      {view === "orders" && (
        <main className="page">
          <div className="toolbar">
            <h2>Recent Orders</h2>
            <button className="btn small" onClick={loadOrders}>Refresh</button>
          </div>
          {ordersError && <div className="error">{ordersError}</div>}
          {!ordersError && orders.length === 0 && <p className="muted">No orders yet.</p>}
          <div className="orders">
            {orders.map((o) => (
              <div className="order" key={o.id}>
                <div>
                  <strong>Order #{o.id}</strong>
                  <div className="muted">{o.customer} · {new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="muted">{o.items.reduce((s, i) => s + i.qty, 0)} item(s)</div>
                <span className="tag">{o.status}</span>
              </div>
            ))}
          </div>
        </main>
      )}

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)} />}
      <aside className={`drawer ${cartOpen ? "open" : ""}`}>
        <div className="drawer-head">
          <h2>Your Cart</h2>
          <button className="link" onClick={() => setCartOpen(false)}>Close</button>
        </div>

        {cartItems.length === 0 ? (
          <p className="muted">Your cart is empty.</p>
        ) : (
          <form onSubmit={placeOrder}>
            {cartItems.map((i) => (
              <div className="line" key={i.id}>
                <span className="mini">{iconFor(i.name)}</span>
                <div className="grow">
                  <div>{i.name}</div>
                  <div className="muted">{money(i.price)}</div>
                </div>
                <div className="qty">
                  <button type="button" onClick={() => change(i.id, -1)}>−</button>
                  <span>{i.qty}</span>
                  <button type="button" onClick={() => change(i.id, 1)}>+</button>
                </div>
              </div>
            ))}
            <div className="total"><span>Total</span><strong>{money(total)}</strong></div>
            <input
              className="field"
              placeholder="Your name"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
            />
            {notice && <div className="error">{notice}</div>}
            <button className="btn full" type="submit" disabled={placing || !customer.trim()}>
              {placing ? "Placing order..." : "Place order"}
            </button>
          </form>
        )}
      </aside>

      <footer className="footer">ShopSphere · a DevOps learning project</footer>
    </div>
  );
}
