import React, { useState, useEffect } from 'react';
import { orderAPI, uploadAPI, productAPI } from '../services/api';

const Services = () => {
  const [formData, setFormData] = useState({
    serviceType: 'print',
    printType: 'black-white',
    paperSize: 'A4',
    copies: 1,
    pages: 1,
    customerName: '',
    customerPhone: '',
    pickupTime: 'Today 5 PM',
    notes: '',
    file: null
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

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

  const addItem = (item) => {
    if (!selectedItems.find(i => i._id === item._id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(i => i._id !== id));
  };

  const calculatePrice = () => {
    let pricePerPage = 0;
    
    switch(formData.serviceType) {
      case 'print':
        pricePerPage = formData.printType === 'color' ? 5 : 2;
        break;
      case 'xerox':
        pricePerPage = 1;
        break;
      case 'scan':
        pricePerPage = 5;
        break;
      case 'lamination':
        pricePerPage = 30;
        break;
      case 'binding':
        pricePerPage = 50;
        break;
      default:
        pricePerPage = 2;
    }

    if (formData.paperSize === 'A3') pricePerPage *= 2;
    if (formData.paperSize === 'Legal') pricePerPage *= 1.5;

    const servicePrice = pricePerPage * formData.pages * formData.copies;
    const itemsPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);
    
    return servicePrice + itemsPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = '';
      
      if (formData.file) {
        const uploadData = new FormData();
        uploadData.append('image', formData.file);
        const uploadRes = await uploadAPI.uploadFile(uploadData);
        fileUrl = uploadRes.data.fileUrl;
      }
      
      const price = calculatePrice();
      const orderData = {
        serviceType: formData.serviceType,
        printType: formData.printType,
        paperSize: formData.paperSize,
        // pages: Number(formData.pages),
        copies: Number(formData.copies),
        totalPrice: price,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        pickupTime: formData.pickupTime,
        notes: formData.notes,
        fileUrl: fileUrl,
       items: selectedItems.map(i => ({ itemId: i._id, name: i.name, price: i.price, quantity: 1 }))
      };
      
      const res = await orderAPI.create(orderData);
      setOrderId(res.data.order._id);
      setSubmitted(true);
    } catch (err) {
      alert('Error submitting order: ' + err.message);
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleFileChange = (e) => {
    setFormData({...formData, file: e.target.files[0]});
  };

  const resetForm = () => {
    setSubmitted(false);
    setOrderId('');
    setSelectedItems([]);
    setItemSearch('');
    setFormData({
      serviceType: 'print',
      printType: 'black-white',
      paperSize: 'A4',
      copies: 1,
      pages: 1,
      customerName: '',
      customerPhone: '',
      pickupTime: 'Today 5 PM',
      notes: '',
      file: null
    });
  };

  if (submitted) {
    return (
      <div className="success-page">
        <h2>✅ Order Submitted Successfully!</h2>
        <div className="order-summary">
          <h3>Order ID: {orderId}</h3>
          <p><strong>Service:</strong> {formData.serviceType.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹{calculatePrice()}</p>
          <p><strong>Pickup Time:</strong> {formData.pickupTime}</p>
          <p><strong>Name:</strong> {formData.customerName}</p>
          <p><strong>Phone:</strong> {formData.customerPhone}</p>
          
          {selectedItems.length > 0 && (
            <div className="items-summary">
              <p><strong>Added Items:</strong></p>
              {selectedItems.map(item => (
                <p key={item._id}>• {item.name} - ₹{item.price}</p>
              ))}
            </div>
          )}
          
             <div className="payment-section">
  <h3>💳 Payment Options</h3>
  
  {/* UPI ID */}
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
  
  {/* QR Code */}
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
  
  <p className="payment-note">
    After payment, click "Submit Order" and owner will verify.
  </p>
</div>
          
          <button onClick={resetForm} className="new-order-btn">
            📝 New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <h2>🖨️ Our Services</h2>
      
      <div className="services-grid">
        <div className="service-card">
          <h3>🖨️ Print</h3>
          <p>B&W: ₹2/page</p>
          <p>Color: ₹5/page</p>
        </div>
        <div className="service-card">
          <h3>📄 Xerox</h3>
          <p>₹1/page (A4)</p>
        </div>
        <div className="service-card">
          <h3>📷 Scan</h3>
          <p>₹5/document</p>
        </div>
        <div className="service-card">
          <h3>📎 Lamination</h3>
          <p>₹30/document</p>
        </div>
        <div className="service-card">
          <h3>📚 Spiral Binding</h3>
          <p>₹50/report</p>
        </div>
      </div>

      <h2>📝 Place Your Order</h2>
      
      <form onSubmit={handleSubmit} className="service-form">
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
                  Black & White (₹2/page)
                </label>
                <label>
                  <input
                    type="radio"
                    name="printType"
                    value="color"
                    checked={formData.printType === 'color'}
                    onChange={handleChange}
                  />
                  Color (₹5/page)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Paper Size:</label>
              <select name="paperSize" value={formData.paperSize} onChange={handleChange}>
                <option value="A4">A4</option>
                <option value="A3">A3 (2x price)</option>
                <option value="Legal">Legal (1.5x price)</option>
              </select>
            </div>
          </>
        )}

        

        <div className="form-group">
          <label>Copies:</label>
          <input
            type="number"
            name="copies"
            min="1"
            value={formData.copies}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Upload File (optional):</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
            onChange={handleFileChange}
          />
          <small>PDF, Word, Images accepted</small>
        </div>

        {/* Searchable Items */}
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

        <div className="price-box">
          <h3>Estimated Price: ₹{calculatePrice()}</h3>
          <p>Pay via UPI after submitting</p>
        </div>

        <button type="submit" className="submit-btn">
          ✅ Submit Order
        </button>
      </form>
    </div>
  );
};

export default Services;