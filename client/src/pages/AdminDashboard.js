import React, { useState, useEffect } from 'react';
import api, { productAPI, orderAPI, uploadAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [earnings, setEarnings] = useState({ totalEarnings: 0, totalOrders: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '', category: 'pens', price: '', quantity: '', description: '', image: '', isPopular: false, isNew: false
  });
  
  const fetchProducts = async () => {
    try {
      const res = await productAPI.getAll();
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await api.get('/orders/stats/today');
      setEarnings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderAPI.getAll();
      const newOrders = res.data.orders;
      
      if (newOrders.length > orders.length && orders.length > 0) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio blocked'));
      }
      
      setOrders(newOrders);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  if (!localStorage.getItem('adminToken')) {
    navigate('/admin-login');
    return;
  }

  fetchProducts();
  fetchOrders();
  fetchEarnings();

  const interval = setInterval(fetchOrders, 30000);
  const earningsInterval = setInterval(fetchEarnings, 60000);

  return () => {
    clearInterval(interval);
    clearInterval(earningsInterval);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await productAPI.update(editingId, formData);
      } else {
        await productAPI.create(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', category: 'pens', price: '', quantity: '', description: '', image: '', isPopular: false, isNew: false });
      setImagePreview('');
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      description: product.description || '',
      image: product.image || '',
      isPopular: product.isPopular || false,
      isNew: product.isNew || false
    });
    setEditingId(product._id);
    setImagePreview(product.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await productAPI.delete(id);
      fetchProducts();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      const res = await uploadAPI.uploadFile(uploadData);
      setFormData({...formData, image: res.data.fileUrl});
      setImagePreview('');
    } catch (err) {
      alert('Error uploading image');
      console.error(err);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      fetchOrders();
    } catch (err) {
      alert('Error updating order');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>⚙️ Admin Dashboard</h2>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      <div className="stats-box">
        <div className="stat-card">
          <h3>{products.length}</h3>
          <p>Products</p>
        </div>
        <div className="stat-card alert">
          <h3>{pendingOrders}</h3>
          <p>Pending Orders</p>
        </div>
        <div className="stat-card">
          <h3>{orders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card green">
          <h3>₹{earnings.totalEarnings}</h3>
          <p>Today's Earnings</p>
        </div>
        <div className="stat-card blue">
          <h3>{earnings.totalOrders}</h3>
          <p>Today's Orders</p>
        </div>
      </div>

      <div className="tab-buttons">
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          📦 Products
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          📝 Orders {pendingOrders > 0 && <span className="badge">{pendingOrders}</span>}
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: '', category: 'pens', price: '', quantity: '', description: '', image: '', isPopular: false, isNew: false }); setImagePreview(''); }} className="add-btn">
            + Add Product
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <h3>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
              
              <div className="form-row">
                <input 
                  placeholder="Product Name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="pens">Pens</option>
                  <option value="paper">Paper</option>
                  <option value="copies">Copies</option>
                  <option value="art-supplies">Art Supplies</option>
                  <option value="stationery">Stationery</option>
                </select>
              </div>
              
              <div className="form-row">
                <input 
                  type="number" 
                  placeholder="Price ₹" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  value={formData.quantity} 
                  onChange={e => setFormData({...formData, quantity: e.target.value})} 
                  required 
                />
              </div>
              
              <input 
                placeholder="Description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                style={{marginBottom: '20px'}}
              />
              
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '10px', color: '#667eea', fontWeight: '600'}}>
                  📸 Product Image:
                </label>
                
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{marginBottom: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px'}}
                />
                
                <p style={{textAlign: 'center', color: '#888', margin: '10px 0'}}>— OR —</p>
                
                <input 
                  placeholder="Paste image URL from Google" 
                  value={formData.image || ''} 
                  onChange={e => setFormData({...formData, image: e.target.value})}
                />
                
                {(imagePreview || formData.image) && (
                  <div style={{marginTop: '15px', textAlign: 'center'}}>
                    <img 
                      src={imagePreview || formData.image} 
                      alt="Preview" 
                      style={{maxWidth: '200px', maxHeight: '200px', borderRadius: '15px', border: '2px solid rgba(102, 126, 234, 0.5)'}}
                    />
                  </div>
                )}
              </div>
              
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPopular || false}
                    onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                  />
                  <span>🔥 Popular</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isNew || false}
                    onChange={e => setFormData({...formData, isNew: e.target.checked})}
                  />
                  <span>✨ New</span>
                </label>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="save-btn">💾 Save Product</button>
                <button type="button" onClick={() => { setShowForm(false); setImagePreview(''); }} className="cancel-btn">❌ Cancel</button>
              </div>
            </form>
          )}

          <table className="product-table">
            <thead>
              <tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.displayQuantity}</td>
                  <td><span className={`status ${p.stockStatus}`}>{p.stockStatus}</span></td>
                  <td>
                    <button onClick={() => handleEdit(p)} className="edit-btn">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          {orders.length === 0 ? (
            <p className="no-orders">No orders yet</p>
          ) : (
            orders.map(order => (
              <div key={order._id} className={`order-card ${order.status}`}>
                <div className="order-header">
                  <h4>Order #{order._id.slice(-6)}</h4>
                  <span className={`order-status ${order.status}`}>{order.status}</span>
                </div>
                <div className="order-details">
                  <p><strong>Service:</strong> {order.serviceType}</p>
                    {order.items && order.items.length > 0 && (
    <div className="order-items">
      <p><strong>Items:</strong></p>
      {order.items.map((item, idx) => (
        <p key={idx}>• {item.name} × {item.quantity} = ₹{item.price * item.quantity}</p>
      ))}
    </div>
  )}
                  <p><strong>Customer:</strong> {order.customerName} ({order.customerPhone})</p>
                  <p><strong>Pickup:</strong> {order.pickupTime}</p>
                  <p><strong>Amount:</strong> ₹{order.totalPrice}</p>
                  {order.pages > 1 && <p><strong>Pages:</strong> {order.pages} × {order.copies} copies</p>}
                  {order.notes && <p><strong>Notes:</strong> {order.notes}</p>}
                  {order.fileUrl && (
                    <p>
                      <strong>📎 File:</strong> 
                      <a href={order.fileUrl} target="_blank" rel="noreferrer" className="file-link">
                        Download File
                      </a>
                    </p>
                  )}
                </div>
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <>
                      <button onClick={() => updateOrderStatus(order._id, 'processing')} className="process-btn">Start Processing</button>
                      <a href={`https://wa.me/91${order.customerPhone}?text=Hi%20${order.customerName},%20your%20order%20is%20confirmed!`} target="_blank" rel="noreferrer" className="whatsapp-btn">📱 WhatsApp</a>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <>
                      <button onClick={() => updateOrderStatus(order._id, 'ready')} className="ready-btn">✅ Mark Ready</button>
                      <a href={`https://wa.me/91${order.customerPhone}?text=Hi%20${order.customerName},%20your%20order%20is%20ready!%20Come%20and%20pickup.`} target="_blank" rel="noreferrer" className="whatsapp-btn">📱 WhatsApp Ready</a>
                    </>
                  )}
                  {order.status === 'ready' && (
                    <>
                      <button onClick={() => updateOrderStatus(order._id, 'completed')} className="complete-btn">Complete</button>
                      <span className="done-text">Waiting for pickup</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;