import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServicesSection = () => {
  const navigate = useNavigate();
  
  const services = [
    { icon: '🖨️', title: 'Print', desc: 'B&W & Color printing', price: '₹3/page' },
    { icon: '📄', title: 'Xerox', desc: 'Fast photocopying', price: '₹2/page' },
    { icon: '📷', title: 'Scan', desc: 'Document scanning', price: '₹5/doc' },
    { icon: '📎', title: 'Lamination', desc: 'Document protection', price: '₹30+' },
    { icon: '📚', title: 'Binding', desc: 'Spiral binding', price: '₹50+' },
    { icon: '💻', title: 'Cyber Cafe', desc: 'Internet & typing', price: '₹20/hr' },
    { icon: '📝', title: 'Form Fill', desc: 'Online forms', price: '₹50+' },
    { icon: '🎨', title: 'Project Work', desc: 'Charts & models', price: 'Custom' }
  ];

  return (
    <div className="services-section">
      <h2>🎯 Our Services</h2>
      <div className="services-grid-home">
        {services.map((service, idx) => (
          <div key={idx} className="service-card-home" onClick={() => navigate('/services')}>
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
            <span className="service-price">{service.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSection;