import React from 'react';
import './ConditionDropdown.css';

const ConditionDropdown = ({ 
  value, 
  onChange, 
  label = 'Condition',
  disabled = false,
  className = '',
  showAllOption = true 
}) => {
  const options = [
    ...(showAllOption ? [{ value: 'all', label: 'All' }] : []),
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'used', label: 'Used' }
  ];

  return (
    <div className={`condition-dropdown-wrapper ${className}`}>
      {label && (
        <label htmlFor={`condition-${label}`} className="condition-dropdown-label">
          {label}
        </label>
      )}
      <select
        id={`condition-${label}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="condition-dropdown-select"
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

export default React.memo(ConditionDropdown);