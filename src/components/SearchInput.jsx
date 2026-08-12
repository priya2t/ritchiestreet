import React from 'react';
import './SearchInput.css';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Search products...', 
  disabled = false,
  className = '' 
}) => {
  return (
    <div className={`search-input-wrapper ${className}`}>
      <svg 
        className="search-input-icon" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="search-input-field"
        aria-label={placeholder}
      />
      {value && (
        <button
          className="search-input-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default React.memo(SearchInput);