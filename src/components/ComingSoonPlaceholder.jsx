import React from 'react';
import './ComingSoonPlaceholder.css';

const ComingSoonPlaceholder = () => {
  return (
    <div className="coming-soon-placeholder" role="region" aria-label="Products coming soon">
      <div className="coming-soon-placeholder__icon">
        <svg 
          width="80" 
          height="80" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>
      <h2 className="coming-soon-placeholder__title">Products Coming Soon</h2>
      <p className="coming-soon-placeholder__subtitle">
        We're adding products to this category. Please check back soon.
      </p>
    </div>
  );
};

export default React.memo(ComingSoonPlaceholder);