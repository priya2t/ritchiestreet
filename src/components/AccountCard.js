import React from 'react';

const AccountCard = ({ children, className = '', style = {} }) => {
  return (
    <div 
      className={`account-card ${className}`}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        padding: '24px',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default AccountCard;
