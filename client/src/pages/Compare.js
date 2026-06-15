import React from 'react';
import { useCompare } from '../context/CompareContext';
import { useNavigate } from 'react-router-dom';

const Compare = () => {
  const { compareList, clearCompare } = useCompare();
  const navigate = useNavigate();

  if (compareList.length < 2) {
    return (
      <div className="compare-page empty">
        <h2>⚖️ Compare Products</h2>
        <p>Add at least 2 products to compare</p>
        <button onClick={() => navigate('/')} className="shop-btn">Browse Products</button>
      </div>
    );
  }

  const fields = [
    { label: 'Image', key: 'image', type: 'image' },
    { label: 'Name', key: 'name' },
    { label: 'Price', key: 'price', prefix: '₹' },
    { label: 'Category', key: 'category' },
    { label: 'Stock', key: 'stockStatus' },
    { label: 'Description', key: 'description' },
  ];

  return (
    <div className="compare-page">
      <h2>⚖️ Compare Products</h2>
      
      <div className="compare-table">
        <div className="compare-header">
          <div className="compare-label">Feature</div>
          {compareList.map(p => (
            <div key={p._id} className="compare-product-header">
              <img src={p.image} alt={p.name} />
              <h3>{p.name}</h3>
            </div>
          ))}
        </div>
        
        {fields.map(field => (
          <div key={field.key} className="compare-row">
            <div className="compare-label">{field.label}</div>
            {compareList.map(p => (
              <div key={`${p._id}-${field.key}`} className="compare-value">
                {field.type === 'image' ? (
                  <img src={p[field.key]} alt={p.name} className="compare-img" />
                ) : field.key === 'stockStatus' ? (
                  <span className={`badge ${p[field.key]}`}>
                    {p[field.key] === 'in-stock' ? 'In Stock' : 
                     p[field.key] === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                ) : (
                  <span>{field.prefix}{p[field.key]}</span>
                )}
              </div>
            ))}
          </div>
        ))}
        
        <div className="compare-row actions">
          <div className="compare-label">Action</div>
          {compareList.map(p => (
            <div key={`${p._id}-action`} className="compare-value">
              <button onClick={() => navigate(`/product/${p._id}`)} className="view-btn">
                View Product
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={clearCompare} className="clear-btn">Clear All</button>
    </div>
  );
};

export default Compare;