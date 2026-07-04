import React from 'react';

const AddressCard = ({ title, address, onEdit, onAdd, isEditing, children, type }) => {
  const hasAddress = address && (
    address.first_name || 
    address.address_1 || 
    address.city || 
    address.state
  );

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      padding: '24px',
      transition: 'all 0.3s ease',
      border: '1px solid #e2e8f0',
      minHeight: '200px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '24px'
          }}>
            {type === 'billing' ? '💳' : '🚚'}
          </span>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0'
          }}>
            {title}
          </h3>
        </div>
        {!isEditing && (
          <button
            onClick={hasAddress ? onEdit : onAdd}
            style={{
              padding: '8px 16px',
              backgroundColor: hasAddress ? '#ffffff' : '#f15b29',
              color: hasAddress ? '#f15b29' : '#ffffff',
              border: hasAddress ? '1px solid #f15b29' : 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {hasAddress ? 'Edit' : 'Add'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          {children}
        </div>
      ) : hasAddress ? (
        <div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 8px 0'
          }}>
            {address.first_name} {address.last_name}
          </p>
          {address.company && (
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 8px 0'
            }}>
              {address.company}
            </p>
          )}
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 8px 0',
            lineHeight: '1.6'
          }}>
            {address.address_1}
            {address.address_2 && <><br />{address.address_2}</>}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 8px 0'
          }}>
            {address.city}, {address.state} {address.postcode}
          </p>
          {address.phone && (
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 8px 0'
            }}>
              📞 {address.phone}
            </p>
          )}
          {address.email && (
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0'
            }}>
              ✉️ {address.email}
            </p>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          color: '#94a3b8'
        }}>
          <span style={{ fontSize: '48px', marginBottom: '12px' }}>📍</span>
          <p style={{
            fontSize: '14px',
            margin: '0 0 16px 0'
          }}>
            No {title.toLowerCase()} set
          </p>
          <button
            onClick={onAdd}
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
            Add {title}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
