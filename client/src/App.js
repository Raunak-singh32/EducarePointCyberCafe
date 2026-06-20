import React from 'react';
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
import { useScrollTint, useStickyNav } from './useScrollEffects';
import './App.css';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const scrolled = useStickyNav();
  useScrollTint();

  return (
    <div className="App">
      {/* Scroll tint overlay */}
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
      <div className="scroll-tint-overlay">
      </div>
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-gradient-bg"></div>
        <div className="floating-shapes">
          <div className="shape shape-circle shape-1"></div>
          <div className="shape shape-square shape-2"></div>
          <div className="shape shape-circle shape-3"></div>
          <div className="shape shape-triangle shape-4"></div>
          <div className="shape shape-square shape-5"></div>
        </div>
        <div className="particle-network">
          {[...Array(12)].map((_, i) => (
            <span key={i} className={`particle-dot dot-${i + 1}`}></span>
          ))}
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Educare Point Cyber Cafe</h1>
          <p className="hero-subtitle">Stationery, printing & cyber services — done right.</p>
        </div>
      </section>

      {/* Sticky Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <Navbar />
      </nav>
      
      {/* Page transitions */}
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
  
  return (
    <div className="nav-buttons">
      <button onClick={() => navigate('/')}>📦 Products</button>
      <button onClick={() => navigate('/services')}>🖨️ Services</button>
      <button onClick={() => navigate('/my-orders')}>📋 My Orders</button>
      <button onClick={() => navigate('/cart')} className="cart-btn">
        🛒 Cart {cart.length > 0 && <span className="cart-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
      </button>
      <button onClick={() => navigate('/admin-login')} className="admin-btn">🔐 Admin</button>
    </div>
  );
}

export default App;