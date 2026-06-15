import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    customerName: '',
    customerPhone: '',
    pickupTime: 'Today 5 PM'
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      const orderItems = cart.map(item => ({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));
      
      await orderAPI.create({
        serviceType: 'product-order',
        items: orderItems,
        totalPrice: total,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        pickupTime: orderData.pickupTime
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
        <p>Your order will be ready for pickup at {orderData.pickupTime}</p>
        <div className="order-details-summary">
          <p>Total: ₹{total}</p>
          <p>Phone: {orderData.customerPhone}</p>
        </div>
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
          <button onClick={() => setShowCheckout(true)} className="checkout-btn">Proceed to Checkout</button>
        ) : (
          <form onSubmit={handleCheckout} className="checkout-form">
            <input
              type="text"
              placeholder="Your Name"
              value={orderData.customerName}
              onChange={e => setOrderData({...orderData, customerName: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={orderData.customerPhone}
              onChange={e => setOrderData({...orderData, customerPhone: e.target.value})}
              pattern="[0-9]{10}"
              required
            />
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