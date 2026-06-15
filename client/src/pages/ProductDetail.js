import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            fetchRelated();
        }
    }, [product, id]);

    const fetchProduct = async () => {
        try {
            const res = await productAPI.getById(id);
            setProduct(res.data.product);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelated = async () => {
        try {
            const res = await productAPI.getAll();
            const related = res.data.products
                .filter(p => p.category === product?.category && p._id !== id)
                .slice(0, 4);
            setRelatedProducts(related);
        } catch (err) {
            console.error(err);
        }
    };
     
    const handleShare = () => {
    const url = window.location.href;
    const text = `Check out ${product.name} at Educare Point Cyber Cafe - ₹${product.price}`;
    
    if (navigator.share) {
        navigator.share({
            title: product.name,
            text: text,
            url: url
        });
    } else {
        // Fallback for WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        window.open(whatsappUrl, '_blank');
    }
};

    if (loading) return <div className="loading">Loading...</div>;
    if (!product) return <div className="error">Product not found</div>;

    return (
        <div className="product-detail">
            <button onClick={() => navigate('/')} className="back-btn">← Back to Products</button>
            
            <div className="detail-card">
                <div className="detail-image">
                    {product.image ? (
                        <img src={product.image} alt={product.name} />
                    ) : (
                        <div className="placeholder-large">No Image</div>
                    )}
                </div>
                
                <div className="detail-info">
                    <h1>{product.name}</h1>
                    <p className="detail-category">{product.category}</p>
                    <p className="detail-price">₹{product.price}</p>
                    
                    <div className={`stock-badge ${product.stockStatus}`}>
                        {product.stockStatus === 'in-stock' ? '✅ In Stock' : 
                         product.stockStatus === 'low-stock' ? '⚠️ Low Stock' : '⏳ Coming Soon'}
                    </div>
                    
                    {product.isPopular && <span className="badge popular">🔥 Popular</span>}
                    {product.isNew && <span className="badge new">✨ New</span>}
                    
                    <p className="detail-description">{product.description}</p>
                    
                    <div className="detail-actions">
                        <button 
                            onClick={() => addToCart(product)} 
                            className="add-to-cart-btn"
                            disabled={product.stockStatus === 'out-of-stock'}
                        >
                            {product.stockStatus === 'out-of-stock' ? '⏳ Coming Soon' : '🛒 Add to Cart'}
                        </button>
                        <a 
                            href={`https://wa.me/918888435103?text=Hi,%20I%20want%20to%20order%20${product.name}%20₹${product.price}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="whatsapp-order-btn"
                        >
                            💬 Chat for Order
                        </a>
                        <button onClick={handleShare} className="share-btn">
    📤 Share
</button>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="related-section">
                    <h2>📌 Related Products</h2>
                    <div className="related-grid">
                        {relatedProducts.map(p => (
                            <div key={p._id} className="related-card" onClick={() => navigate(`/product/${p._id}`)}>
                                <img src={p.image} alt={p.name} />
                                <h4>{p.name}</h4>
                                <p>₹{p.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;