import React, { createContext, useState, useContext } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  const addToCompare = (product) => {
    if (compareList.length >= 3) {
      alert('You can compare maximum 3 products');
      return;
    }
    if (!compareList.find(p => p._id === product._id)) {
      setCompareList([...compareList, product]);
    }
  };

  const removeFromCompare = (id) => {
    setCompareList(compareList.filter(p => p._id !== id));
  };

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);