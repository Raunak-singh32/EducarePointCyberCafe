import React from 'react';

const Testimonials = () => {
  const reviews = [
    {
      name: "Rahul Kumar",
      text: "Best cyber cafe in town! Got my project work done in 2 hours.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      text: "Love the online ordering. I check stock from home and pickup quickly.",
      rating: 5
    },
    {
      name: "Amit Singh",
      text: "Print quality is amazing. Prices are very reasonable.",
      rating: 4
    }
  ];

  return (
    <div className="testimonials-section">
      <h2>💬 What Customers Say</h2>
      <div className="testimonials-grid">
        {reviews.map((review, idx) => (
          <div key={idx} className="testimonial-card">
            <div className="stars">
              {'⭐'.repeat(review.rating)}
            </div>
            <p className="review-text">"{review.text}"</p>
            <p className="reviewer-name">— {review.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;