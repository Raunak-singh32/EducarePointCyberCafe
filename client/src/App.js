import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ProductList from './pages/ProductList';
import Services from './pages/Services';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import OrderHistory from './pages/OrderHistory';
import { useCart } from './context/CartContext';
import Cart from './pages/Cart';
import ScrollToTop from './components/ScrollToTop';
import ProductDetail from './pages/ProductDetail';
import Compare from './pages/Compare';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useScrollTint, useStickyNav } from './useScrollEffects';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const navigate  = useNavigate();
  const navHidden = useStickyNav();
  useScrollTint();

  return (
    <div className="App">
      <div className="bg-slideshow">
        <div className="bg-slide bg-slide-1"></div>
        <div className="bg-slide bg-slide-2"></div>
        <div className="bg-slide bg-slide-3"></div>
        <div className="bg-slide bg-slide-4"></div>
        <div className="bg-slide bg-slide-5"></div>
        <div className="bg-slide bg-slide-6"></div>
        <div className="bg-slide bg-slide-7"></div>
        <div className="bg-slide bg-slide-8"></div>
      </div>

      <div className="scroll-tint-overlay"></div>

      <nav className={`navbar ${navHidden ? 'navbar-hidden' : ''}`}>
        <Navbar />
      </nav>
      {/* ── Badges Row: Trade Licence + Printout side by side ── */}
      <div className={`badges-row ${navHidden ? 'badge-hidden' : ''}`}>
        <div className="trade-licence-badge">✓ TRADE LICENCE</div>
        <div
          className="printout-badge"
          onClick={() => navigate('/services')}
          title="Click to place a print order"
        >
          🖨️ PRINTOUT
        </div>
      </div>

      <div className="page-fade-wrapper" key={location.pathname}>
        <main>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/services" element={<Services />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/my-orders" element={<OrderHistory />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>

      <footer className="app-footer">
        <p>© 2026 Educare Point Cyber Cafe</p>
      </footer>

      <a
        href="https://wa.me/919331443939?text=Hi%20Educare%20Point,%20I%20have%20a%20question"
        className="whatsapp-float"
        target="_blank"
        rel="noreferrer"
      >
        💬
      </a>
      <ScrollToTop />
    </div>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  // ── SECRET ADMIN SHORTCUT: hold A + D + M simultaneously ──
  // No visible button — only you and the admin know this
  useEffect(() => {
    const pressedKeys = new Set();

    const handleKeyDown = (e) => {
      if (!e.key) return;
      pressedKeys.add(e.key.toLowerCase());
      if (pressedKeys.has('a') && pressedKeys.has('d') && pressedKeys.has('m')) {
        pressedKeys.clear();
        navigate('/admin-login');
      }
    };

    const handleKeyUp = (e) => {
      if (!e.key) return;
      pressedKeys.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [navigate]);

  const handleUserClick = () => {
    if (user) {
      if (window.confirm(`Logout from ${user.name}?`)) {
        logout();
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="nav-buttons">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <img
          src="/wheel-rotating.gif"
          alt="Educare Point"
          className="nav-logo"
        />
        <span className="nav-brand-text">Educare Point</span>
      </div>

            {/* Login / Sign Up Buttons */}
      {user ? (
        <button
          className="nav-login-icon-btn"
          onClick={handleUserClick}
          title={`Logged in as ${user.name}`}
        >
          <span className="nav-user-initial">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </button>
      ) : (
        <div className="auth-buttons">
          <button className="login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
          <span className="auth-divider">|</span>
          <button className="signup-btn" onClick={() => navigate('/login')}>
            Sign Up
          </button>
        </div>
      )}

      <button onClick={() => navigate('/')}>📦 Products</button>
      <button onClick={() => navigate('/services')}>🖨️ Services</button>
      <button onClick={() => navigate('/my-orders')}>📋 My Orders</button>
      <button onClick={() => navigate('/cart')} className="cart-btn">
        🛒 Cart {cart.length > 0 && <span className="cart-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
      </button>
    </div>
  );
}

export default App;