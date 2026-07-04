import React from 'react';

const AccountHeader = ({ user, onEditProfile, onLogout }) => {
  const getInitials = (firstName, lastName) => {
    const first = firstName || '';
    const last = lastName || '';
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  };

  const memberSince = user?.date_created 
    ? new Date(user.date_created).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long'
      })
    : 'Not available';

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      padding: '32px',
      marginBottom: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient accent strip */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '6px',
        background: 'linear-gradient(90deg, #f15b29 0%, #f15b29 100%)'
      }}></div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {/* Left side: User info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flex: '1',
          minWidth: '280px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f15b29 0%, #f15b29 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: '700',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(241, 91, 41, 0.3)'
          }}>
            {getInitials(user?.first_name, user?.last_name)}
          </div>

          {/* User details */}
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {user?.first_name} {user?.last_name}
            </h2>
            {user?.email && !user?.email?.includes('temp_') && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ✉️ {user.email}
              </p>
            )}
            {user?.billing_phone && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📞 {user.billing_phone}
              </p>
            )}
            <p style={{
              fontSize: '13px',
              color: '#94a3b8',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📅 Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Right side: Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onEditProfile}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffffff',
              color: '#f15b29',
              border: '1px solid #f15b29',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f15b29',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountHeader;
