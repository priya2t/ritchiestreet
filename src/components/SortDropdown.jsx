import React from 'react';
import './SortDropdown.css';

const SortDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  label = 'Sort By',
  disabled = false,
  className = '' 
}) => {
  return (
    <div className={`sort-dropdown-wrapper ${className}`}>
      {label && (
        <label htmlFor={`sort-${label}`} className="sort-dropdown-label">
          {label}
        </label>
      )}
      <select
        id={`sort-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="sort-dropdown-select"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(SortDropdown);