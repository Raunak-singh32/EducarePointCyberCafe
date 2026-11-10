import React, { useState, useEffect } from 'react';
import { orderAPI, uploadAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getNumericPrice } from '../context/CartContext';

const Services = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceType: 'print',
    printType: 'black-white',
    paperSize: 'A4',
    copies: 1,
    pageRange: '1',
    customerName: '',
    customerPhone: '',
    deliveryType: 'pickup',
    pickupTime: 'Today 5 PM',
    notes: '',
    file: null
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');

  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [detectedPages, setDetectedPages] = useState(null);
  const [detectingPages, setDetectingPages] = useState(false);
  const [savedOrderData, setSavedOrderData] = useState(null); // for WhatsApp button on success screen

  // Auto-fill from logged in user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || '',
        customerPhone: user.whatsapp || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchAvailableItems();
  }, []);

  const fetchAvailableItems = async () => {
    try {
      const res = await productAPI.getAll();
      setAvailableItems(res.data.products.filter(p => p.stockStatus === 'in-stock'));
    } catch (err) {
      console.error(err);
    }
  };

  const parsePageRange = (rangeStr, totalPages = null) => {
    if (!rangeStr || rangeStr.trim() === '') return 1;
    const str = rangeStr.trim().toLowerCase();
    if (str === 'all') return totalPages || 1;

    let total = 0;
    const parts = str.split(',');
    for (let part of parts) {
      part = part.trim();
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr.trim());
        const end = parseInt(endStr.trim());
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          total += end - start + 1;
        }
      } else {
        const n = parseInt(part);
        if (!isNaN(n) && n > 0) total += 1;
      }
    }
    return total || 1;
  };

  const getPdfPageCount = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const matches = text.match(/\/Count\s+(\d+)/g);
          if (matches && matches.length > 0) {
            const counts = matches.map(m => parseInt(m.replace(/\/Count\s+/, '')));
            resolve(Math.max(...counts));
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsBinaryString(file);
    });
  };

  const addItem = (item) => {
    if (!selectedItems.find(i => i._id === item._id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i._id !== id));
  };

  const productSubtotal = selectedItems.reduce((sum, item) => sum + getNumericPrice(item.price), 0);

  // ── Step 1: Go to Payment Selection ──
  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      alert('Please fill in your name and phone number');
      return;
    }
    if (formData.customerPhone.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setStep('payment');
    window.scrollTo(0, 0);
  };

  // ── Step 2: Handle Payment Method Selection ──
  const handlePaymentMethodSelect = async (method) => {
    setPaymentMethod(method);
    if (method === 'cod') {
      await createOrder('cod');
    }
    // Cash on pickup is the only payment method available right now.
  };

  // ── Step 3: Create Order ──
  const createOrder = async (method) => {
    setSubmitting(true);
    try {
      let fileUrl = '';
      let fileName = '';

      if (formData.file) {
        try {
          const uploadData = new FormData();
          uploadData.append('image', formData.file);
          const uploadRes = await uploadAPI.uploadFile(uploadData);
          fileUrl = uploadRes.data.fileUrl;
          fileName = uploadRes.data.fileName || formData.file.name;
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          alert('File upload failed, but continuing without file...');
        }
      }

      const needsPageRange = formData.serviceType === 'print' || formData.serviceType === 'xerox';
      const resolvedPages = needsPageRange
        ? parsePageRange(formData.pageRange, detectedPages)
        : 1;

      const orderData = {
        serviceType: formData.serviceType,
        printType: formData.printType,
        paperSize: formData.paperSize,
        pages: resolvedPages,
        pageRange: formData.pageRange,
        copies: Number(formData.copies),
        totalPrice: productSubtotal,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        deliveryType: 'pickup',
        address: '',
        pickupTime: formData.pickupTime,
        notes: formData.notes,
        fileUrl,
        fileName,
        paymentMethod: method,
        items: selectedItems.map(i => ({ itemId: i._id, name: i.name, price: getNumericPrice(i.price), quantity: 1 }))
      };

      // ── Single order creation ──
      const res = await orderAPI.create(orderData);
      const newOrderId = res.data.order._id;

      setOrderId(newOrderId);
      setSavedOrderData({ ...orderData, id: newOrderId }); // ← save for WhatsApp button
      setStep('success');
      return newOrderId;

    } catch (err) {
      console.error('Full error:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        alert(`Error: ${err.response.data.message || err.message}`);
      } else {
        alert('Network error. Please check your connection.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, file }));
    setDetectedPages(null);

    if (file.type === 'application/pdf') {
      setDetectingPages(true);
      const count = await getPdfPageCount(file);
      setDetectingPages(false);
      if (count) {
        setDetectedPages(count);
        setFormData(prev => ({ ...prev, file, pageRange: `1-${count}` }));
      }
    }
  };

  const resetForm = () => {
    setStep('form');
    setPaymentMethod('');
    setOrderId('');
    setSavedOrderData(null);
    setSelectedItems([]);
    setItemSearch('');
    setDetectedPages(null);
    setDetectingPages(false);
    setFormData({
      serviceType: 'print',
      printType: 'black-white',
      paperSize: 'A4',
      copies: 1,
      pageRange: '1',
      customerName: user ? user.name : '',
      customerPhone: user ? user.whatsapp : '',
      deliveryType: 'pickup',
      pickupTime: 'Today 5 PM',
      notes: '',
      file: null
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: SUCCESS SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (step === 'success') {
    return (
      <div className="success-page">
        <div className="success-icon">✅</div>
        <h2>Order Confirmed!</h2>

        <div className="order-summary-card">
          <h3>Order ID: {orderId}</h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>Save this full ID with your phone number to check this order later.</p>

          <div className="summary-row">
            <span>Service:</span>
            <span>{formData.serviceType.toUpperCase()}</span>
          </div>
          {selectedItems.length > 0 && (
            <div className="summary-row">
              <span>Product subtotal:</span>
              <span className="price">₹{productSubtotal}</span>
            </div>
          )}
          <div className="summary-row"><span>Service cost:</span><span>Confirmed at shop</span></div>
          <div className="summary-row"><span>Pickup:</span><span>🏪 Pickup from shop</span></div>
          <div className="summary-row">
            <span>Name:</span>
            <span>{formData.customerName}</span>
          </div>
          <div className="summary-row">
            <span>Phone:</span>
            <span>{formData.customerPhone}</span>
          </div>

          {selectedItems.length > 0 && (
            <div className="items-summary">
              <p><strong>Added Items:</strong></p>
              {selectedItems.map(item => (
                <p key={item._id}>• {item.name} - ₹{item.price}</p>
              ))}
            </div>
          )}

          <div className="cod-notice">
            <div className="notice-icon">💰</div>
            <h4>Cash on Pickup</h4>
            <p>Pay the product subtotal and the service cost confirmed at the shop when you collect your order.</p>
            <p>You'll receive a WhatsApp confirmation shortly.</p>
          </div>
        </div>

        {/* ── WhatsApp Notify Button — customer taps manually, never blocked ── */}
        {savedOrderData && (
          <button
            onClick={() => {
              const OWNER_PHONE = '919331443939';
              const msg =
`🔔 *New Order - Educare Point*

📋 Order ID: #${orderId.slice(-6)}
👤 Customer: ${savedOrderData.customerName}
📞 Phone: ${savedOrderData.customerPhone}
🖨️ Service: ${savedOrderData.serviceType.toUpperCase()}
📦 Pickup from shop
🛍️ Product subtotal: ₹${savedOrderData.totalPrice}
🖨️ Service cost: Confirmed at shop
💳 Payment: ${savedOrderData.paymentMethod.toUpperCase()}`;
              window.open(`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
            }}
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
              boxShadow: '0 6px 20px rgba(37,211,102,0.35)'
            }}
          >
            📲 Notify Shop Owner on WhatsApp
          </button>
        )}

        <button onClick={resetForm} className="new-order-btn">📝 Place New Order</button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: PAYMENT SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (step === 'payment') {
    return (
      <div className="services-page payment-step">
        <h2>💳 Choose Payment Method</h2>

        <div className="payment-methods">
          <div className="payment-card payment-card-disabled" aria-disabled="true">
            <div className="payment-icon">📱</div>
            <h3>Pay Now (UPI)</h3>
            <p>Coming soon</p>
          </div>

          <div
            className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
            onClick={() => handlePaymentMethodSelect('cod')}
          >
            <div className="payment-icon">💵</div>
            <h3>Cash on Pickup</h3>
            <p>Pay when you collect your order</p>
          </div>
        </div>

        {paymentMethod === 'cod' && submitting && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>Creating your order...</p>
          </div>
        )}

        <button onClick={() => setStep('form')} className="back-btn full-width">
          ← Back to Order Details
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: ORDER FORM
  // ═══════════════════════════════════════════════════════════════
  const needsPageRange = formData.serviceType === 'print' || formData.serviceType === 'xerox';
  const parsedPageCount = parsePageRange(formData.pageRange, detectedPages);

  return (
    <div className="services-page">
      <h2>🖨️ Our Services</h2>

      <div className="services-grid">
        <div className="service-card"><h3>🖨️ Print</h3><p>Black &amp; white or color printing</p></div>
        <div className="service-card"><h3>📄 Xerox</h3><p>Document photocopying</p></div>
        <div className="service-card"><h3>📷 Scan</h3><p>Document scanning</p></div>
        <div className="service-card"><h3>📎 Lamination</h3><p>Document lamination</p></div>
        <div className="service-card"><h3>📚 Spiral Binding</h3><p>Report binding</p></div>
      </div>
      <p className="service-cost-note">Service cost will be confirmed at the shop before work begins.</p>

      <h2>📝 Place Your Order</h2>

      <form onSubmit={handleProceedToPayment} className="service-form">

        {user && (
          <div className="autofill-banner">
            ✅ Details auto-filled from your account
          </div>
        )}

        {/* {!user && (
          <div className="guest-login-prompt">
            <p>💡 <strong>Login</strong> to auto-fill your details</p>
            <button type="button" onClick={() => navigate('/login')} className="prompt-login-btn">Login / Sign Up</button>
            <p className="skip-text">or fill manually below</p>
          </div>
        )} */}

        <div className="form-group">
          <label>Select Service:</label>
          <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
            <option value="print">Print</option>
            <option value="xerox">Xerox</option>
            <option value="scan">Scan</option>
            <option value="lamination">Lamination</option>
            <option value="binding">Spiral Binding</option>
          </select>
        </div>

        {formData.serviceType === 'print' && (
          <>
            <div className="form-group">
              <label>Print Type:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="printType"
                    value="black-white"
                    checked={formData.printType === 'black-white'}
                    onChange={handleChange}
                  />
                  Black & White
                </label>
                <label>
                  <input
                    type="radio"
                    name="printType"
                    value="color"
                    checked={formData.printType === 'color'}
                    onChange={handleChange}
                  />
                  Color
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>Paper Size:</label>
              <select name="paperSize" value={formData.paperSize} onChange={handleChange}>
                <option value="A4">A4</option>
                {/* <option value="A3">A3 (2x price)</option>
                <option value="Legal">Legal (1.5x price)</option> */}
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Copies:</label>
          <input type="number" name="copies" min="1" value={formData.copies} onChange={handleChange} required />
        </div>

        {/* ── File Upload ── */}
        <div className="form-group">
          <label>Upload File (optional):</label>
          <input type="file" accept=".pdf,.doc,.docx,.jpg,.png,.jpeg" onChange={handleFileChange} />
          {detectingPages && (
            <small className="detecting-hint">🔍 Reading PDF page count...</small>
          )}
          {detectedPages && !detectingPages && (
            <div className="pdf-detect-banner">
              📄 PDF detected · <strong>{detectedPages} total pages</strong> · Page range auto-filled below
            </div>
          )}
          {!detectedPages && !detectingPages && (
            <small>PDF, Word, Images accepted</small>
          )}
        </div>

        {/* ── Page Range ── */}
        {needsPageRange && (
          <div className="form-group">
            <label>Pages to Print:</label>
            <input
              type="text"
              name="pageRange"
              value={formData.pageRange}
              onChange={handleChange}
              placeholder="e.g. all or 1-10 or 1-5, 8, 10-12"
            />
            <div className="page-range-hint">
              <span className="page-count-badge">
                📌 {parsedPageCount} page{parsedPageCount !== 1 ? 's' : ''} selected
              </span>
              <span className="page-range-examples">
                Try: <code>all</code> · <code>1-5</code> · <code>1-5, 8</code> · <code>3, 6-9, 12</code>
              </span>
            </div>
          </div>
        )}

        {/* ── Stationery Items ── */}
        <div className="form-group">
          <label>Add Stationery Items:</label>
          <div className="item-search-box">
            <input
              type="text"
              placeholder="🔍 Type to search items..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="item-search-input"
            />
            {itemSearch && (
              <div className="item-dropdown">
                {availableItems
                  .filter(item =>
                    item.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
                    !selectedItems.find(i => i._id === item._id)
                  )
                  .slice(0, 5)
                  .map(item => (
                    <div
                      key={item._id}
                      className="dropdown-item"
                      onClick={() => { addItem(item); setItemSearch(''); }}
                    >
                      <span>{item.name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                {availableItems.filter(item =>
                  item.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
                  !selectedItems.find(i => i._id === item._id)
                ).length === 0 && (
                  <div className="dropdown-item no-match">No items found</div>
                )}
              </div>
            )}
          </div>
          {selectedItems.length > 0 && (
            <div className="selected-items">
              <p><strong>Added Items:</strong></p>
              {selectedItems.map(item => (
                <span key={item._id} className="selected-chip">
                  {item.name} (₹{item.price})
                  <button type="button" onClick={() => removeItem(item._id)}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Customer Details ── */}
        <div className="form-group">
          <label>Your Name: *</label>
          <input
            type="text"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label>Phone Number: *</label>
          <input
            type="tel"
            name="customerPhone"
            required
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="WhatsApp number"
            pattern="[0-9]{10}"
            title="Enter 10 digit phone number"
          />
        </div>

        {/* Delivery is pickup-only until home delivery launches. */}
        <div className="form-group">
          <label>Delivery Method:</label>
          <div className="radio-group delivery-options">
            <label className="delivery-option selected">
              <input type="radio" name="deliveryType" value="pickup" checked readOnly />
              <span className="delivery-icon">🏪</span>
              <div className="delivery-info">
                <strong>Pickup from Shop</strong>
                <small>Come collect at Educare Point</small>
              </div>
            </label>
            <div className="delivery-option delivery-option-disabled" aria-disabled="true">
              <span className="delivery-icon">🚚</span>
              <div className="delivery-info">
                <strong>Home Delivery</strong>
                <small>Coming soon</small>
              </div>
            </div>
          </div>
        </div>

        {/* ── Pickup Time — commented out for now, uncomment later ──
        {formData.deliveryType === 'pickup' && (
          <div className="form-group">
            <label>Pickup Time:</label>
            <select name="pickupTime" value={formData.pickupTime} onChange={handleChange}>
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
        ── */}

        <div className="form-group">
          <label>Special Instructions:</label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special requests..."
          />
        </div>

        {/* <div className="price-box">
          <p><strong>Service cost:</strong> Confirmed at the shop</p>
          <p className="price-note">Any product prices are shown separately. Pay in cash when you pick up your order.</p>
        </div> */}

        <button type="submit" className="submit-btn">
          💳 Proceed to Payment →
        </button>
      </form>
    </div>
  );
};

export default Services;
