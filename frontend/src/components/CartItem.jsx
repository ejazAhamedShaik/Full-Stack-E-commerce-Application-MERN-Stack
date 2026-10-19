import { useCart } from '../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      updateQuantity(item._id, newQuantity);
    }
  };

  const finalPrice = item.discount ? item.price - item.discount : item.price;
  const itemTotal = finalPrice * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.productName} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.productName}</h3>
        <p className="cart-item-brand">{item.brand}</p>

        <div className="cart-item-price">
          <span className="price">₹{finalPrice.toLocaleString()}</span>
          {item.discount > 0 && (
            <span className="original-price">₹{item.price.toLocaleString()}</span>
          )}
        </div>

        <div className="stock-status">
          {item.stock > 0 ? (
            <span className="in-stock">In Stock</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
      </div>

      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button
            className="qty-btn"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            −
          </button>
          <span className="quantity">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            +
          </button>
        </div>

        <div className="item-total">
          <span className="total-label">Subtotal:</span>
          <span className="total-price">₹{itemTotal.toLocaleString()}</span>
        </div>

        <button
          className="remove-btn"
          onClick={() => removeFromCart(item._id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
