import React, { useState } from 'react';
import { orderAPI } from '../services/api';

const OrderHistory = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await orderAPI.getAll();
      const customerOrders = res.data.orders.filter(o => o.customerPhone === phone);
      setOrders(customerOrders);
      setSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="history-page">
      <h2>📋 My Orders</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="[0-9]{10}"
          required
        />
        <button type="submit">Search</button>
      </form>

      {searched && orders.length === 0 && <p className="no-orders">No orders found</p>}

      {orders.map(order => (
        <div key={order._id} className={`order-card ${order.status}`}>
          <h4>Order #{order._id.slice(-6)}</h4>
          <p><strong>Service:</strong> {order.serviceType}</p>
          <p><strong>Amount:</strong> ₹{order.totalPrice}</p>
          <p><strong>Status:</strong> <span className={`status ${order.status}`}>{order.status}</span></p>
          <p><strong>Pickup:</strong> {order.pickupTime}</p>
          <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;