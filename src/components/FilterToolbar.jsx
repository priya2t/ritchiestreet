import React from 'react';
import './FilterToolbar.css';

const FilterToolbar = ({ children, className = '' }) => {
  return (
    <div className={`filter-toolbar ${className}`}>
      {children}
    </div>
  );
};

export default React.memo(FilterToolbar);