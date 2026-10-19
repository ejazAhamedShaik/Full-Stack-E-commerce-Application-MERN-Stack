import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import "./App.css";
import OrdersPage from "./pages/OrdersPage";
import ProductPage from "./pages/ProductPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function Navigation() {
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };
  console.log(user)

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/products" className="nav-logo">
          🛍️ ShopHub
        </Link>

        <div className="nav-links">
          <Link to="/products" className="nav-link">
            Products
          </Link>
          <Link to="/orders" className="nav-link">
            Orders
          </Link>
          <button className="cart-button" onClick={() => navigate("/cart")}>
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-name">Hi, {user.data.name.split(" ")[0]}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/signin" className="nav-link login-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app">
      <Navigation />
      {/* <button onClick={checkout}>Checkout</button> */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:id" element={<ResetPasswordPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
