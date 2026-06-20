import React from 'react';

const ContactSection = () => {
  return (
    <div className="contact-section">
      <h2>📍 Visit Us</h2>
      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon">📍</div>
          <h3>Address</h3>
         <a
  href="https://www.google.com/maps/search/?api=1&query=782+S.K.+Nagar+Rishra+Hooghly+Naya+Basti+Jhaji+More+712249"
  target="_blank"
  rel="noreferrer"
  className="address-link"
>
  📍 Educare Point Cyber Cafe <br />
  782, S.K. Nagar <br />
  Rishra, Hooghly <br />
  Naya Basti, Jhaji More - 712249 <br />
  🗺️ Tap to Open in Google Maps
</a>
        </div>
        
        <div className="contact-card">
          <div className="contact-icon">⏰</div>
          <h3>Timing</h3>
          <p>Monday - Sunday</p>
          <p>9:00 AM - 2:30 PM &5:00 PM - 10:00 PM</p>
        </div>
        
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <h3>Contact</h3>
          <p>Phone: +91 9331443939</p>
          <p>WhatsApp: +91 9331443939</p>
          <a href="https://wa.me/919331443939" target="_blank" rel="noreferrer" className="whatsapp-link">
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;