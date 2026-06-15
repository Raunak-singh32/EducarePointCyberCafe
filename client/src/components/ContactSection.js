import React from 'react';

const ContactSection = () => {
  return (
    <div className="contact-section">
      <h2>📍 Visit Us</h2>
      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon">📍</div>
          <h3>Address</h3>
          <p>Educare Point Cyber Cafe</p>
          <p>[Your City], [Your Area]</p>
          <p>Near [Landmark]</p>
        </div>
        
        <div className="contact-card">
          <div className="contact-icon">⏰</div>
          <h3>Timing</h3>
          <p>Monday - Saturday</p>
          <p>8:00 AM - 8:00 PM</p>
          <p>Sunday: 10:00 AM - 6:00 PM</p>
        </div>
        
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <h3>Contact</h3>
          <p>Phone: +91 8888435103</p>
          <p>WhatsApp: +91 8888435103</p>
          <a href="https://wa.me/918888435103" target="_blank" rel="noreferrer" className="whatsapp-link">
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;