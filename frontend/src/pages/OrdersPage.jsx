import { useEffect, useState } from "react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/orders", {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load orders (${response.status}).`);
        }

        const data = await response.json();
        const result = Array.isArray(data) ? data : data.orders;
        setOrders(Array.isArray(result) ? result : []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load orders.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchOrders();
    return () => controller.abort();
  }, []);

  if (loading) return <main className="orders-page"><p>Loading orders…</p></main>;
  if (error) return <main className="orders-page"><p role="alert">{error}</p></main>;

  return (
    <main className="orders-page">
      <h1>Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <ul className="orders-list">
          {orders.map((order, index) => {
            const id = order._id || order.id || index;
            const items = order.items || order.products || [];
            const total = order.priceAtBooking ?? order.total ?? order.amount;
            const date = order.createdAt || order.date;

            return (
              <li className="order-card" key={id}>
                <h2>Order {order._id || order.id || index + 1}</h2>
                {date && <p>Placed {new Date(date).toLocaleDateString()}</p>}
                {order.status && <p>Status: {order.status}</p>}
                {items.length > 0 && (
                  <ul>
                    {items.map((item, itemIndex) => {
                      const product = item.product || item.productId || item;
                      const title = product.title || product.name || "Item";
                      return (
                        <li key={item._id || product._id || itemIndex}>
                          {title} × {item.quantity || 1}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {total != null && <p>Total: ₹{Number(total).toLocaleString()}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
};

export default OrdersPage;
