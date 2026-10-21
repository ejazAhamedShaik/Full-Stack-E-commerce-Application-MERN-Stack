import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { API_BASE_URL } from "../api";
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
    const payload = {
      items: cartItems.map((item) => ({
        productId: item._id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })),
      priceAtBooking: total,
      user: {
        name: "Ejaz",
        email: "example@gmail.com",
        contact: "9999999999",
      },
    };

    // This endpoint is not part of the current backend API; this flow needs a cart-order endpoint.
    fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), // Replace with actual cart items and price
    })
      .then((response) => response.json())
      .then((data) => {
        const options = {
          key: "rzp_test_vgdcvfBacMw9KC", // your test key
          amount: data.order.amount,
          currency: data.order.currency,
          name: "My Ecommerce Store",
          description: "Test Transaction",
          order_id: data.order.id,

          handler: function (response) {
            console.log("Payment Success");

            console.log(response);
          },

          prefill: {
            name: "Ejaz",
            email: "example@gmail.com",
            contact: "9999999999",
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
