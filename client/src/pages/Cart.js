import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    pickupTime: 'Today 5 PM',
    deliveryType: 'pickup',
    address: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  // Auto-fill from logged in user
  useEffect(() => {
    if (user) {
      setOrderData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerPhone: user.whatsapp || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (orderData.deliveryType === 'delivery' && !orderData.address) {
      alert('Please enter delivery address.');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      setOrderTotal(total);

     await orderAPI.create({
  serviceType: 'product-order',
  items: orderItems,
  totalPrice: Number(total),
  customerName: orderData.customerName,
  customerPhone: orderData.customerPhone,
  pickupTime: orderData.deliveryType === 'delivery' ? 'Home Delivery' : orderData.pickupTime,
  deliveryType: orderData.deliveryType || 'pickup',
  address: orderData.address || ''
});

      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      alert('Error placing order');
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart-page success-page">
        <div className="success-animation">
          <div className="checkmark">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you, {orderData.customerName}!</p>
          {orderData.deliveryType === 'delivery' ? (
            <p>Your order will be delivered to: {orderData.address}</p>
          ) : (
            <p>Your order will be ready for pickup at {orderData.pickupTime}</p>
          )}
          <div className="order-details-summary">
            <p>Total: ₹{orderTotal}</p>
            <p>Phone: {orderData.customerPhone}</p>
          </div>

          <div className="upi-section">
            <p className="upi-label">Pay via UPI:</p>
            <div className="upi-id-box">
              <span className="upi-id">pointeducare@ybl</span>
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText('pointeducare@ybl');
                  alert('UPI ID copied to clipboard!');
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
              alt="PhonePe QR Code"
              className="qr-code"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML += '<p style="color: #ff6b6b;">⚠️ QR code not loaded. Use UPI ID above.</p>';
              }}
            />
            <p className="qr-name">Ajay Kumar Ram</p>
          </div>

          <p className="payment-note">After payment, inform and owner will verify.</p>
          <button onClick={() => navigate('/')} className="shop-btn">Continue Shopping</button>
        </div>
      </div>
    );
  }

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
      <h2>🛒 Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h2>

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
            <div className="item-actions">
              <div className="quantity">
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
              </div>
              <button onClick={() => removeFromCart(item._id)} className="remove-btn">🗑️</button>
            </div>
            <div className="item-total">
              ₹{item.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{total}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {!showCheckout ? (
          <button onClick={() => setShowCheckout(true)} className="checkout-btn">Proceed to payment</button>
        ) : (
          <form onSubmit={handleCheckout} className="checkout-form">

            {/* Auto-fill banner */}
            {user && (
              <div className="autofill-banner">
                ✅ Details auto-filled from your account
              </div>
            )}

            {/* Guest login prompt */}
            {!user && (
              <div className="guest-login-prompt">
                <p>💡 <strong>Login</strong> to auto-fill your details</p>
                <button type="button" onClick={() => navigate('/login')} className="prompt-login-btn">Login / Sign Up</button>
                <p className="skip-text">or fill manually below</p>
              </div>
            )}

            <input
              type="text"
              placeholder="Your Name"
              value={orderData.customerName}
              onChange={e => setOrderData({...orderData, customerName: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp Number"
              value={orderData.customerPhone}
              onChange={e => setOrderData({...orderData, customerPhone: e.target.value})}
              pattern="[0-9]{10}"
              required
            />

            {/* Pickup / Delivery Toggle */}
            <div className="delivery-toggle">
              <button
                type="button"
                className={`toggle-btn ${orderData.deliveryType === 'pickup' ? 'active' : ''}`}
                onClick={() => setOrderData({...orderData, deliveryType: 'pickup'})}
              >
                🏪 Pickup
              </button>
              <button
                type="button"
                className={`toggle-btn ${orderData.deliveryType === 'delivery' ? 'active' : ''}`}
                onClick={() => setOrderData({...orderData, deliveryType: 'delivery'})}
              >
                🚚 Home Delivery
              </button>
            </div>

            {/* Pickup Time */}
            {orderData.deliveryType === 'pickup' && (
              <select
                value={orderData.pickupTime}
                onChange={e => setOrderData({...orderData, pickupTime: e.target.value})}
              >
                <option>Today 10 AM</option>
                <option>Today 12 PM</option>
                <option>Today 3 PM</option>
                <option>Today 5 PM</option>
                <option>Today 7 PM</option>
                <option>Tomorrow 10 AM</option>
              </select>
            )}

            {/* Delivery Address */}
            {orderData.deliveryType === 'delivery' && (
              <input
                type="text"
                placeholder="Full delivery address"
                value={orderData.address}
                onChange={e => setOrderData({...orderData, address: e.target.value})}
                required
              />
            )}

            <button type="submit" className="checkout-btn">Place Order</button>
            <button type="button" onClick={() => setShowCheckout(false)} className="clear-btn">Cancel</button>
          </form>
        )}

        <button onClick={clearCart} className="clear-btn">Clear Cart</button>
      </div>
    </div>
  );
};

export default Cart;