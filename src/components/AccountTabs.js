import React from 'react';

const AccountTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      borderBottom: '2px solid #e2e8f0',
      marginBottom: '24px',
      overflowX: 'auto',
      paddingBottom: '0'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '12px 20px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === tab.id ? '3px solid #f15b29' : '3px solid transparent',
            color: activeTab === tab.id ? '#f15b29' : '#64748b',
            fontSize: '15px',
            fontWeight: activeTab === tab.id ? '600' : '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '18px' }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AccountTabs;
