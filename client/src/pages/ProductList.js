import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useReveal } from '../useScrollEffects';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import Testimonials from '../components/Testimonials';
import ServicesSection from '../components/ServicesSection';
import ContactSection from '../components/ContactSection';
import Loading from '../components/Loading';

function ProductCard({ product, onClick, onQuickView, onAddToCart, onBuyNow }) {
  const { ref, className } = useReveal();

  return (
    <div 
      ref={ref} 
      className={`product-card ${className}`} 
      onClick={onClick}
      style={{cursor: 'pointer'}}
    >
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        <div className="quick-view-overlay">
          <button onClick={(e) => { e.stopPropagation(); onQuickView(product); }} className="quick-view-btn">
            👁️ Quick View
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.description && (
          <p style={{display:'block', opacity:1, visibility:'visible', fontSize:'0.78rem', color:'#bbb', margin:'4px 0 8px', lineHeight:'1.4'}}>
            {product.description}
          </p>
        )}
        <div className="product-footer">
          <span className="price">₹{product.price}</span>
          <div className="badges">
            {product.isPopular && <span className="badge popular">🔥 Popular</span>}
            {product.isNew && <span className="badge new">✨ New</span>}
            <span className={`badge ${product.stockStatus}`}>
              {product.stockStatus === 'in-stock' ? 'In Stock' : 
               product.stockStatus === 'low-stock' ? 'Low Stock' : 'Coming Soon'}
            </span>
          </div>
        </div>
        <div className="product-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="add-to-cart-btn"
            disabled={product.stockStatus === 'out-of-stock'}
          >
            {product.stockStatus === 'out-of-stock' ? '⏳ Coming Soon' : '🛒 Add to Cart'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}
            className="buy-now-btn"
            disabled={product.stockStatus === 'out-of-stock'}
          >
            {product.stockStatus === 'out-of-stock' ? '⏳ Coming Soon' : '⚡ Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ product, onClick, onQuickView, onAddToCart, onBuyNow }) {
  const { ref, className } = useReveal();

  return (
    <div 
      ref={ref} 
      className={`product-card featured-card ${className}`}
      onClick={onClick}
    >
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
        <div className="quick-view-overlay">
          <button onClick={(e) => { e.stopPropagation(); onQuickView(product); }} className="quick-view-btn">
            👁️ Quick View
          </button>
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.description && (
          <p style={{display:'block', opacity:1, visibility:'visible', fontSize:'0.78rem', color:'#bbb', margin:'4px 0 8px', lineHeight:'1.4'}}>
            {product.description}
          </p>
        )}
        <div className="product-footer">
          <span className="price">₹{product.price}</span>
          <div className="badges">
            {product.isPopular && <span className="badge popular">🔥 Popular</span>}
            {product.isNew && <span className="badge new">✨ New</span>}
          </div>
        </div>
        <div className="product-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="add-to-cart-btn"
          >
            🛒 Add to Cart
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}
            className="buy-now-btn"
          >
            ⚡ Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');
    const [loading, setLoading] = useState(true);
    const [quickView, setQuickView] = useState(null);
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let result = products;
        if (search) {
            result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        }
        if (category !== 'all') {
            result = result.filter(p => p.category === category);
        }

        switch(sortBy) {
            case 'popular':
                result = [...result].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
                break;
            case 'new':
                result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
            case 'price-low':
                result = [...result].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                break;
            case 'price-high':
                result = [...result].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                break;
            case 'name':
                result = [...result].sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                break;
        }

        setFiltered(result);
    }, [search, category, sortBy, products]);

    const handleAddToCart = (product) => {
        addToCart(product);
        setToastMessage(`${product.name} added to cart!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleBuyNow = (product) => {
        addToCart(product);
        setToastMessage(`${product.name} added! Proceeding to checkout...`);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            navigate('/cart');
        }, 1000);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productAPI.getAll();
            setProducts(response.data.products);
            setFiltered(response.data.products);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="product-list">
            <div className="search-bar">
                <input 
                    type="text" 
                    placeholder="🔍 Search products..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="all">All Categories</option>
                    <option value="pens">Pens</option>
                    <option value="paper">Paper</option>
                    <option value="copies">Copies</option>
                    <option value="art-supplies">Art Supplies</option>
                    <option value="stationery">Stationery</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">Sort By</option>
                    <option value="popular">🔥 Popular First</option>
                    <option value="new">✨ New First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                </select>
            </div>

            {products.filter(p => p.isPopular || p.isNew).length > 0 && (
                <div className="featured-section">
                    <h2>🔥 Featured Products</h2>
                    <div className="products-grid featured">
                        {products
                            .filter(p => p.isPopular || p.isNew)
                            .map(product => (
                                <FeaturedCard
                                    key={`featured-${product._id}`}
                                    product={product}
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    onQuickView={setQuickView}
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                />
                            ))}
                    </div>
                </div>
            )}

            <div className="products-grid">
                {filtered.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onClick={() => navigate(`/product/${product._id}`)}
                        onQuickView={setQuickView}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                    />
                ))}
            </div>

            {filtered.length === 0 && <p className="no-results">No products found</p>}

            {quickView && createPortal(
                <div className="quick-view-modal" onClick={() => setQuickView(null)}>
                    <div className="quick-view-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setQuickView(null)}>✕</button>
                        <div className="quick-view-image">
                            <img src={quickView.image} alt={quickView.name} />
                        </div>
                        <div className="quick-view-info">
                            <h2>{quickView.name}</h2>
                            <p className="price">₹{quickView.price}</p>
                            {quickView.description && (
                              <p style={{fontSize:'0.85rem', color:'#bbb', margin:'6px 0', lineHeight:'1.5'}}>
                                {quickView.description}
                              </p>
                            )}
                            <span className={`badge ${quickView.stockStatus}`}>
                                {quickView.stockStatus === 'in-stock' ? 'In Stock' : 'Coming Soon'}
                            </span>
                            <div className="quick-view-actions">
                                <button onClick={() => { handleAddToCart(quickView); setQuickView(null); }} className="add-to-cart-btn">
                                    🛒 Add to Cart
                                </button>
                                <button onClick={() => { handleBuyNow(quickView); setQuickView(null); }} className="buy-now-btn">
                                    ⚡ Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {showToast && (
                <div className="toast-notification">
                    ✅ {toastMessage}
                </div>
            )}

            <ContactSection />
            <ServicesSection />
            <Testimonials />
        </div>
    );
};

export default ProductList;