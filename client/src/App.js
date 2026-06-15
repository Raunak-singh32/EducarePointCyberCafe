import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>🏪 Educare Point Cyber Cafe</h1>
          <p>Stationery | Prints | Services</p>
          <Navbar />
        </header>
        
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
        
        <footer className="app-footer">
          <p>© 2026 Educare Point Cyber Cafe</p>
        </footer>
        <a 
  href="https://wa.me/8820425203?text=Hi%20Educare%20Point,%20I%20have%20a%20question" 
  className="whatsapp-float" 
  target="_blank" 
  rel="noreferrer"
>
  💬
</a>
        <ScrollToTop />
      </div>
    </Router>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { cart } = useCart();
  
  return (
    <nav className="nav-buttons">
      <button onClick={() => navigate('/')}>📦 Products</button>
      <button onClick={() => navigate('/services')}>🖨️ Services</button>
      <button onClick={() => navigate('/my-orders')}>📋 My Orders</button>
     <button onClick={() => navigate('/cart')} className="cart-btn">
  🛒 Cart {cart.length > 0 && <span className="cart-badge">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
</button>
      <button onClick={() => navigate('/admin-login')} className="admin-btn">🔐 Admin</button>
    </nav>
  );
}

export default App;