import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: '#fff7ed', text: '#f15b29', dot: '#f15b29' };
      case 'processing':
        return { bg: '#eff6ff', text: '#2563eb', dot: '#2563eb' };
      case 'completed':
        return { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' };
      case 'cancelled':
        return { bg: '#fef2f2', text: '#dc2626', dot: '#dc2626' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', dot: '#64748b' };
    }
  };

  const statusColors = getStatusColor(order.status);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 4px 0'
          }}>
            Order #{order.id}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0'
          }}>
            {new Date(order.date_created).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div style={{
          backgroundColor: statusColors.bg,
          color: statusColors.text,
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600',
          textTransform: 'capitalize',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColors.dot
          }}></span>
          {order.status}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 4px 0'
          }}>
            Total
          </p>
          <p style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: '0'
          }}>
            ₹{order.total}
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => navigate(`/order-success/${order.id}`, { state: { order } })}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              color: '#f15b29',
              border: '1px solid #f15b29',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            View Order
          </button>
          <button
            onClick={() => navigate(`/order-success/${order.id}`, { state: { order } })}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f15b29',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
