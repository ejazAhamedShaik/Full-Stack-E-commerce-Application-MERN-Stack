/* eslint-disable react/prop-types */
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL, apiFetch } from '../api';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addToCart(product);
    // Optional: Show a toast notification
  };

  const handleBuyNow = () => {
    apiFetch(`${API_BASE_URL}/order/${product._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceAtBooking: product.price }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Order request failed (${response.status})`);
        }
        return data;
      })
      .then((data) => {
        const order = data.razorpayOrder;
        if (!order) {
          throw new Error('Order response did not include Razorpay order details');
        }
        // Redirect to Razorpay checkout page with order id from response
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_vgdcvfBacMw9KC',
          amount: order.amount,
          currency: order.currency,
          name: 'My Ecommerce Store',
          description: 'Test Transaction',
          order_id: order.id,
          handler: function (response) {
            // Call /api/order/verify endpoint with POST method and body as response from Razorpay
            apiFetch(`${API_BASE_URL}/order/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            })
              .then(async (verificationResponse) => {
                const result = await verificationResponse.json();
                if (!verificationResponse.ok) {
                  throw new Error(result.message || 'Payment verification failed');
                }
                window.alert('Payment successful! Your order is confirmed.');
              })
              .catch((error) => {
                console.error('Payment verification failed:', error);
                window.alert(error.message);
              });
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      })
      .catch((error) => {
        console.error('Unable to start checkout:', error);
        window.alert(error.message);
      });
  };

  const finalPrice = product.discount ? product.price - product.discount : product.price;
  const discountPercentage = product.discount
    ? Math.round((product.discount / product.price) * 100)
    : 0;

  return (
    <div className="product-card">
      {discountPercentage > 0 && (
        <div className="discount-badge">{discountPercentage}% OFF</div>
      )}

      <div className="product-image">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.productName} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.productName}</h3>
        <button
          className="btn btn-buy-now"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          View details & reviews
        </button>
        <p className="product-brand">{product.brand}</p>

        <div className="product-rating">
          <span className="stars">{'★'.repeat(Math.round(product.averageRating || 0))}</span>
          <span className="rating-value">{product.averageRating?.toFixed(1) || 'N/A'}</span>
        </div>

        <div className="product-price">
          <span className="final-price">₹{finalPrice.toLocaleString()}</span>
          {product.discount > 0 && (
            <span className="original-price">₹{product.price.toLocaleString()}</span>
          )}
        </div>

        <p className="product-description">{product.description}</p>

        <div className="stock-info">
          {product.stock > 0 ? (
            <span className="in-stock">In Stock ({product.stock})</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="btn btn-add-cart"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </button>
          <button
            className="btn btn-buy-now"
            onClick={handleBuyNow}
            disabled={product.stock === 0}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
