import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  // step: 'cart' | 'details' | 'payment' | 'upi' | 'cod' | 'success'
  const [step, setStep] = useState('cart');
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    pickupTime: 'Today 5 PM',
    deliveryType: 'pickup',
    address: '',
    paymentMethod: '',
  });
  const [screenshotFile, setScreenshotFile]   = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId]     = useState(null);
  const [savedOrderData, setSavedOrderData]   = useState(null);

  const deliveryCharge = orderData.deliveryType === 'delivery' ? 15 : 0;
  const grandTotal     = total + deliveryCharge;

  // Auto-fill from logged-in user
  useEffect(() => {
    if (user) {
      setOrderData(prev => ({
        ...prev,
        customerName:  user.name     || '',
        customerPhone: user.whatsapp || '',
        address:       user.address  || '',
      }));
    }
  }, [user]);

  // ── Create order ──
  const createOrder = async (paymentMethod) => {
    const orderItems = cart.map(item => ({
      itemId:   item._id,
      name:     item.name,
      price:    item.price,
      quantity: item.quantity,
    }));
    const res = await orderAPI.create({
      serviceType:   'product-order',
      items:         orderItems,
      totalPrice:    grandTotal,
      customerName:  orderData.customerName,
      customerPhone: orderData.customerPhone,
      pickupTime:    orderData.deliveryType === 'delivery' ? 'Home Delivery' : orderData.pickupTime,
      deliveryType:  orderData.deliveryType,
      address:       orderData.address || '',
      paymentMethod,
      paymentStatus: 'pending',
    });
    return res.data.order._id;
  };

  // ── Notify owner via WhatsApp (tap-triggered) ──
  const notifyOwner = (method) => {
    const OWNER_PHONE = '919331443939';
    const msg =
`🔔 *New Product Order - Educare Point*

📋 Order ID: #${placedOrderId?.slice(-6) || 'N/A'}
👤 Customer: ${orderData.customerName}
📞 Phone: ${orderData.customerPhone}
📦 Delivery: ${orderData.deliveryType === 'pickup' ? 'Pickup' : 'Home Delivery'}
💰 Total: ₹${grandTotal}
💳 Payment: ${method?.toUpperCase() || 'N/A'}`;
    window.open(`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Proceed to details ──
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!orderData.customerName.trim())
      return alert('Please enter your name');
    if (!orderData.customerPhone.trim() || orderData.customerPhone.length !== 10)
      return alert('Please enter a valid 10-digit phone number');
    if (orderData.deliveryType === 'delivery' && !orderData.address.trim())
      return alert('Please enter delivery address');
    setStep('payment');
  };

  // ── UPI submit ──
  const handleUPISubmit = async () => {
    setIsSubmitting(true);
    try {
      const newOrderId = await createOrder('upi');
      setPlacedOrderId(newOrderId);
      setSavedOrderData({ ...orderData, paymentMethod: 'upi', id: newOrderId });
      if (screenshotFile) {
        const fd = new FormData();
        fd.append('screenshot', screenshotFile);
        await orderAPI.uploadPaymentScreenshot(newOrderId, fd);
      }
      clearCart();
      setStep('success');
    } catch {
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── COD submit ──
  const handleCODSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newOrderId = await createOrder('cod');
      setPlacedOrderId(newOrderId);
      setSavedOrderData({ ...orderData, paymentMethod: 'cod', id: newOrderId });
      clearCart();
      setStep('success');
    } catch {
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // ════════════════════════════════════════════════
  // STEP 1 — CART VIEW
  // ════════════════════════════════════════════════
  if (step === 'cart') {
    if (cart.length === 0) {
      return (
        <div className="cart-page empty">
          <h2>🛒 Your Cart is Empty</h2>
          <p>Add some products to get started!</p>
          <button onClick={() => navigate('/')} className="shop-btn">Start Shopping</button>
        </div>
      );
    }
    return (
      <div className="cart-page">
        <h2>🛒 Your Cart ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h2>

        <div className="cart-items">
          {cart.map(item => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="category">{item.category}</p>
                <p className="price">₹{item.price}</p>
              </div>
              <div className="quantity">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
              </div>
              <button onClick={() => removeFromCart(item._id)} className="remove-btn">🗑️</button>
              <div className="item-total">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{total}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
          <button onClick={() => setStep('details')} className="submit-btn">
            Proceed to Payment →
          </button>
          <button onClick={clearCart} className="clear-btn">Clear Cart</button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // STEP 2 — ORDER DETAILS  (same look as Services form)
  // ════════════════════════════════════════════════
  if (step === 'details') {
    return (
      <div className="services-page">
        <h2>📦 Order Details</h2>

        <form onSubmit={handleProceedToPayment} className="service-form">

          {user && (
            <div className="autofill-banner">✅ Details auto-filled from your account</div>
          )}
          {!user && (
            <div className="guest-login-prompt">
              <p>💡 <strong>Login</strong> to auto-fill your details</p>
              <button type="button" onClick={() => navigate('/login')} className="prompt-login-btn">
                Login / Sign Up
              </button>
              <p className="skip-text">or fill manually below</p>
            </div>
          )}

          {/* Items summary */}
          <div className="form-group">
            <label>Your Items:</label>
            <div className="selected-items">
              {cart.map(item => (
                <span key={item._id} className="selected-chip">
                  {item.name} ×{item.quantity} — ₹{item.price * item.quantity}
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Your Name: *</label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={orderData.customerName}
              onChange={e => setOrderData({ ...orderData, customerName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number: *</label>
            <input
              type="tel"
              required
              placeholder="10-digit WhatsApp number"
              value={orderData.customerPhone}
              onChange={e => setOrderData({ ...orderData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              pattern="[0-9]{10}"
            />
          </div>

          {/* Delivery method */}
          <div className="form-group">
            <label>Delivery Method: *</label>
            <div className="radio-group delivery-options">
              <label className={`delivery-option ${orderData.deliveryType === 'pickup' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={orderData.deliveryType === 'pickup'}
                  onChange={e => setOrderData({ ...orderData, deliveryType: e.target.value })}
                />
                <span className="delivery-icon">🏪</span>
                <div className="delivery-info">
                  <strong>Pickup from Shop</strong>
                  <small>Come collect at Educare Point</small>
                </div>
              </label>
              <label className={`delivery-option ${orderData.deliveryType === 'delivery' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={orderData.deliveryType === 'delivery'}
                  onChange={e => setOrderData({ ...orderData, deliveryType: e.target.value })}
                />
                <span className="delivery-icon">🚚</span>
                <div className="delivery-info">
                  <strong>Home Delivery</strong>
                  <small>+₹15 delivery charge</small>
                </div>
              </label>
            </div>
          </div>

          {orderData.deliveryType === 'pickup' && (
            <div className="form-group">
              <label>Pickup Time:</label>
              <select
                value={orderData.pickupTime}
                onChange={e => setOrderData({ ...orderData, pickupTime: e.target.value })}
              >
                <option>Today 10 AM</option>
                <option>Today 12 PM</option>
                <option>Today 2 PM</option>
                <option>Today 5 PM</option>
                <option>Today 7 PM</option>
                <option>Tomorrow 10 AM</option>
                <option>Tomorrow 12 PM</option>
                <option>When Available wtsp me</option>
              </select>
            </div>
          )}

          {orderData.deliveryType === 'delivery' && (
            <div className="form-group">
              <label>Delivery Address: *</label>
              <textarea
                rows="3"
                required
                placeholder="Enter your full address with landmark..."
                value={orderData.address}
                onChange={e => setOrderData({ ...orderData, address: e.target.value })}
              />
            </div>
          )}

          {/* Price box — same as Services */}
          <div className="price-box">
            <div>
              <h3>Total: ₹{grandTotal}</h3>
              {deliveryCharge > 0 && (
                <p className="delivery-charge">(Includes ₹15 delivery charge)</p>
              )}
            </div>
            <p>Proceed to select payment</p>
          </div>

          <button type="submit" className="submit-btn">💳 Proceed to Payment →</button>
          <button type="button" className="back-btn" style={{ marginTop: '10px' }} onClick={() => setStep('cart')}>
            ← Back to Cart
          </button>
        </form>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // STEP 3 — CHOOSE PAYMENT  (identical to Services)
  // ════════════════════════════════════════════════
  if (step === 'payment') {
    return (
      <div className="services-page payment-step">
        <h2>💳 Choose Payment Method</h2>

        <div className="payment-methods">
          <div className="payment-card" onClick={() => setStep('upi')}>
            <div className="payment-icon">📱</div>
            <h3>Pay Now (UPI)</h3>
            <p>Scan QR &amp; pay instantly</p>
          </div>
          <div className="payment-card" onClick={() => handleCODSubmit()}>
            <div className="payment-icon">💵</div>
            <h3>Cash on {orderData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</h3>
            <p>Pay when you receive</p>
          </div>
        </div>

        {isSubmitting && (
          <div className="processing-overlay">
            <div className="spinner" />
            <p>Creating your order...</p>
          </div>
        )}

        <button className="back-btn full-width" onClick={() => setStep('details')}>
          ← Back to Order Details
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // STEP 4 — UPI PAYMENT  (identical to Services)
  // ════════════════════════════════════════════════
  if (step === 'upi') {
    return (
      <div className="services-page payment-step">
        <h2>📱 Pay via UPI</h2>

        <div className="upi-payment-section">
          <div className="upi-amount">
            <h3>Amount to Pay: ₹{grandTotal}</h3>
          </div>

          <div className="upi-details">
            <div className="upi-id-box">
              <p className="upi-label">UPI ID:</p>
              <div className="upi-copy-row">
                <span className="upi-id">pointeducare@ybl</span>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText('pointeducare@ybl');
                    alert('UPI ID copied!');
                  }}
                >
                  📋 Copy
                </button>
              </div>
            </div>

            <div className="qr-section">
              <p className="qr-label">Or scan QR code:</p>
              <img
                src="/phonepe-qr.png"
                alt="PhonePe QR"
                className="qr-code"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<p class="qr-fallback">Use UPI ID above</p>';
                }}
              />
              <p className="qr-name">Ajay Kumar Ram</p>
            </div>
          </div>

          {/* Screenshot upload */}
          <div className="screenshot-upload">
            <h4>📤 Upload Payment Screenshot</h4>
            <p className="upload-hint">After paying, take a screenshot and upload here for verification</p>
            <div className="file-upload-box">
              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                id="cart-screenshot-input"
                className="hidden-input"
              />
              <label htmlFor="cart-screenshot-input" className="upload-label">
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Screenshot preview" className="screenshot-preview" />
                ) : (
                  <>
                    <span className="upload-icon">📷</span>
                    <span>Click to upload screenshot</span>
                  </>
                )}
              </label>
            </div>

            <button
              className="submit-payment-btn"
              onClick={handleUPISubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Processing...' : "✅ I've Paid - Submit Order"}
            </button>
            <button className="back-btn" onClick={() => setStep('payment')}>
              ← Choose Different Method
            </button>
          </div>
        </div>

        <button className="back-btn full-width" style={{ marginTop: '10px' }} onClick={() => setStep('payment')}>
          ← Back to Payment Options
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // SUCCESS
  // ════════════════════════════════════════════════
  if (step === 'success') {
    const isUPI = savedOrderData?.paymentMethod === 'upi';

    return (
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h2>Order {isUPI ? 'Submitted!' : 'Confirmed!'}</h2>

        <div className="order-summary-card">
          <h3>Order #{placedOrderId?.slice(-6)}</h3>

          <div className="summary-row">
            <span>Customer:</span><span>{orderData.customerName}</span>
          </div>
          <div className="summary-row">
            <span>Phone:</span><span>{orderData.customerPhone}</span>
          </div>
          <div className="summary-row">
            <span>Total:</span>
            <span className="price">₹{grandTotal}</span>
          </div>
          <div className="summary-row">
            <span>Delivery:</span>
            <span>{orderData.deliveryType === 'delivery' ? '🚚 Home Delivery' : '🏪 Pickup'}</span>
          </div>
          {orderData.deliveryType === 'pickup' && (
            <div className="summary-row">
              <span>Pickup Time:</span><span>{orderData.pickupTime}</span>
            </div>
          )}

          {/* Items */}
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
            <p style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--color-blue)' }}>Items Ordered:</p>
            {cart.length === 0
              ? <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Order placed successfully</p>
              : null
            }
          </div>

          {isUPI ? (
            <div className="verification-notice">
              <div className="notice-icon">⏳</div>
              <h4>Payment Verification Pending</h4>
              <p>Your payment screenshot has been sent to the shop owner.</p>
              <p>Order will be processed after verification.</p>
              <p className="notice-hint">You'll receive a WhatsApp confirmation shortly.</p>
            </div>
          ) : (
            <div className="cod-notice">
              <div className="notice-icon">💰</div>
              <h4>Cash on {orderData.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</h4>
              <p>Please keep ₹{grandTotal} ready.</p>
              <p>You'll receive a WhatsApp confirmation shortly.</p>
            </div>
          )}
        </div>

        {/* WhatsApp notify button */}
        <button
          onClick={() => notifyOwner(savedOrderData?.paymentMethod)}
          style={{
            width: '100%',
            padding: '14px',
            background: '#25d366',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginBottom: '10px',
            boxShadow: '0 6px 20px rgba(37,211,102,0.35)',
          }}
        >
          📲 Notify Shop Owner on WhatsApp
        </button>

        <button className="new-order-btn" onClick={() => navigate('/')}>
          🛍️ Continue Shopping
        </button>
      </div>
    );
  }

  return null;
};

export default Cart;