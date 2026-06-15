import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   <CompareProvider>
  <CartProvider>
    <App />
  </CartProvider>
</CompareProvider>
  </React.StrictMode>
);
