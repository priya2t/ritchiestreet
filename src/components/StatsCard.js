import React from 'react';

const StatsCard = ({ icon, label, value, color = '#f15b29' }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      padding: '24px',
      transition: 'all 0.3s ease',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      minHeight: '140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
    }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <span style={{
          fontSize: '32px'
        }}>
          {icon}
        </span>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '20px',
            color: color
          }}>
            {icon}
          </span>
        </div>
      </div>

      <div>
        <p style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 4px 0'
        }}>
          {value}
        </p>
        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: '0',
          fontWeight: '500'
        }}>
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
