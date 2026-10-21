import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { API_BASE_URL, apiFetch } from "../api";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();
  const itemCount = getCartCount();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const checkout = () => {
    apiFetch(`${API_BASE_URL}/order/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cartItems.map(({ _id, quantity }) => ({ productId: _id, quantity })) }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Checkout failed (${response.status})`);
        return data;
      })
      .then(({ razorpayOrder }) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_vgdcvfBacMw9KC",
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "My Ecommerce Store",
          description: "Cart checkout",
          order_id: razorpayOrder.id,
          handler: async (payment) => {
            const response = await apiFetch(`${API_BASE_URL}/order/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Payment verification failed");
            clearCart();
            window.alert("Payment successful! Your order is confirmed.");
          },
          theme: {
            color: "#3399cc",
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.open();
      })
      .catch((error) => {
        console.error("Error during checkout:", error);
        window.alert(error.message || "Unable to start checkout");
      });
  };
  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p className="cart-count">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>

          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span className="free">FREE</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button className="checkout-btn" onClick={checkout}>
            Proceed to Checkout
          </button>

          <button
            className="continue-shopping-link"
            onClick={() => navigate("/products")}
          >
            ← Continue Shopping
          </button>

          <div className="benefits">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Free Shipping</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Easy Returns</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Secure Payment</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
