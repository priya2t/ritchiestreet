import React from 'react';
import './BestPriceCheck.css';

const BestPriceCheck = ({ onClick, disabled, compact = false, text = 'Market Price Comparison' }) => {
  const displayText = compact ? 'Compare' : text;
  return (
    <button
      type="button"
      className={`bpc-button ${compact ? 'bpc-button--compact' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label="Check market price comparison"
      title={text}
    >
      <span className="bpc-icon" aria-hidden="true">💰</span>
      <span className="bpc-text">{displayText}</span>
    </button>
  );
};

export default BestPriceCheck;
