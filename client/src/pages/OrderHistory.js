import React, { useState } from 'react';
import { orderAPI } from '../services/api';

const statusLabel = {
  pending:    { text: 'Pending',     color: '#f59e0b' },
  processing: { text: 'Processing',  color: '#3b82f6' },
  ready:      { text: 'Ready',       color: '#8b5cf6' },
  delivered:  { text: 'Delivered',   color: '#10b981' },
  cancelled:  { text: 'Cancelled',   color: '#ef4444' },
};

const paymentLabel = {
  pending:  { text: 'Payment Pending',     color: '#f59e0b' },
  paid:     { text: 'Paid',                color: '#10b981' },
  failed:   { text: 'Payment Failed',      color: '#ef4444' },
  refunded: { text: 'Refunded',            color: '#6366f1' },
};

const OrderHistory = () => {
  const [phone, setPhone]       = useState('');
  const [orders, setOrders]     = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    setError('');
    setOrders([]);
    try {
      const res = await orderAPI.getByPhone(phone);
      setOrders(res.data.orders);
      setSearched(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactOnWhatsApp = (order) => {
    const msg = `Hi, I want to check my order #${order._id.slice(-6)} for ${order.serviceType} service.`;
    window.open(`https://wa.me/919331443939?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="history-page">
      <h2>📋 My Orders</h2>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', opacity: 0.7 }}>
        Enter the phone number you used while placing the order
      </p>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="tel"
          placeholder="Enter your 10-digit phone number"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
            setError('');
          }}
          maxLength={10}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Orders'}
        </button>
      </form>

      {error && (
        <p style={{ textAlign: 'center', color: '#ef4444', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      {searched && orders.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
          <p style={{ fontSize: '2rem' }}>📭</p>
          <p>No orders found for this number.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Make sure you enter the same number used while ordering.
          </p>
        </div>
      )}

      {orders.map(order => {
        const status  = statusLabel[order.status]  || { text: order.status,  color: '#888' };
        const payment = paymentLabel[order.paymentStatus] || { text: order.paymentStatus, color: '#888' };

        return (
          <div key={order._id} className={`order-card ${order.status}`}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>Order #{order._id.slice(-6)}</h4>
              <span style={{
                background: status.color + '22',
                color: status.color,
                padding: '2px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: `1px solid ${status.color}44`
              }}>
                {status.text}
              </span>
            </div>

            {/* Details */}
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <p><strong>Service:</strong> {order.serviceType?.toUpperCase()}
                {order.printType ? ` — ${order.printType === 'color' ? 'Color' : 'Black & White'}` : ''}
              </p>
              {order.copies > 1 && <p><strong>Copies:</strong> {order.copies}</p>}
              <p><strong>Amount:</strong> ₹{order.totalPrice}</p>
              <p>
                <strong>Payment:</strong>{' '}
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}{' '}
                <span style={{ color: payment.color, fontWeight: 600 }}>({payment.text})</span>
              </p>
              <p><strong>Delivery:</strong>{' '}
                {order.deliveryType === 'pickup'
                  ? `Pickup — ${order.pickupTime || 'time not set'}`
                  : `Home Delivery — ${order.address || ''}`}
              </p>
              {order.fileName && (
                <p><strong>File:</strong> {order.fileName}</p>
              )}
              {order.notes && (
                <p><strong>Notes:</strong> {order.notes}</p>
              )}
              <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>

            {/* WhatsApp contact */}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <button
                onClick={() => contactOnWhatsApp(order)}
                style={{
                  marginTop: '0.75rem',
                  background: '#25d366',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                💬 Ask on WhatsApp
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderHistory;