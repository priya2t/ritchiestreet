import React, { useEffect, useState } from 'react';
import { useUserStore } from './userStore';
import { useNavigate } from 'react-router-dom';
import { getCustomer, updateCustomer, getOrders } from './woocommerce';
import Layout from './Layout';
import AccountHeader from '../components/AccountHeader';
import AccountTabs from '../components/AccountTabs';
import StatsCard from '../components/StatsCard';
import OrderCard from '../components/OrderCard';
import AddressCard from '../components/AddressCard';

const isChennaiCity = (city) => {
  if (!city || city.trim() === '') return false;
  return city.trim().toLowerCase() === 'chennai';
};

const MyAccount = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, setUser } = useUserStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBilling, setEditingBilling] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [billingForm, setBillingForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
    phone: '',
    email: ''
  });
  
  const [shippingForm, setShippingForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
    phone: '',
    email: ''
  });

  const [accountForm, setAccountForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  // Sync account form when user data changes
  useEffect(() => {
    if (user) {
      setAccountForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('=== MY ACCOUNT: USER NOT AUTHENTICATED ===');
      console.log('Saving redirectAfterLogin: /my-account');
      sessionStorage.setItem('redirectAfterLogin', '/my-account');
      navigate('/login');
    } else {
      fetchCustomerData();
    }
  }, [isAuthenticated, navigate]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      console.log('=== MY ACCOUNT: FETCH CUSTOMER DATA START ===');
      
      // Fetch fresh customer data from backend
      if (user && user.id) {
        const freshData = await getCustomer(user.id);
        console.log('Fresh customer data from backend:', JSON.stringify(freshData, null, 2));
        
        // Update user store with fresh data
        const updatedUser = {
          ...user,
          first_name: freshData.first_name || freshData.billing.first_name || user.first_name,
          last_name: freshData.last_name || freshData.billing.last_name || user.last_name,
          email: freshData.email || freshData.billing.email || user.email || '',
          date_created: freshData.date_created || user.date_created,
          billing_first_name: freshData.billing.first_name,
          billing_last_name: freshData.billing.last_name,
          billing_company: freshData.billing.company,
          billing_address_1: freshData.billing.address_1,
          billing_address_2: freshData.billing.address_2,
          billing_city: freshData.billing.city,
          billing_state: freshData.billing.state,
          billing_postcode: freshData.billing.postcode,
          billing_country: freshData.billing.country,
          billing_phone: freshData.billing.phone,
          billing_email: freshData.billing.email,
          shipping_first_name: freshData.shipping.first_name,
          shipping_last_name: freshData.shipping.last_name,
          shipping_company: freshData.shipping.company,
          shipping_address_1: freshData.shipping.address_1,
          shipping_address_2: freshData.shipping.address_2,
          shipping_city: freshData.shipping.city,
          shipping_state: freshData.shipping.state,
          shipping_postcode: freshData.shipping.postcode,
          shipping_country: freshData.shipping.country,
          shipping_phone: freshData.shipping.phone,
          shipping_email: freshData.shipping.email || ''
        };
        
        setUser(updatedUser);
        console.log('User store updated with fresh data');
        
        // Initialize forms with fresh data
        setBillingForm({
          first_name: freshData.billing.first_name || '',
          last_name: freshData.billing.last_name || '',
          company: freshData.billing.company || '',
          address_1: freshData.billing.address_1 || '',
          address_2: freshData.billing.address_2 || '',
          city: freshData.billing.city || '',
          state: freshData.billing.state || '',
          postcode: freshData.billing.postcode || '',
          country: freshData.billing.country || 'IN',
          phone: freshData.billing.phone || '',
          email: freshData.billing.email || freshData.email || ''
        });
        
        setShippingForm({
          first_name: freshData.shipping.first_name || '',
          last_name: freshData.shipping.last_name || '',
          company: freshData.shipping.company || '',
          address_1: freshData.shipping.address_1 || '',
          address_2: freshData.shipping.address_2 || '',
          city: freshData.shipping.city || '',
          state: freshData.shipping.state || '',
          postcode: freshData.shipping.postcode || '',
          country: freshData.shipping.country || 'IN',
          phone: freshData.shipping.phone || '',
          email: freshData.shipping.email || freshData.email || ''
        });
        
        // Fetch orders for this customer
        console.log('Fetching orders for customer:', user.id);
        try {
          const ordersData = await getOrders(user.id);
          console.log('Orders data:', ordersData);
          setOrders(ordersData);
        } catch (ordersError) {
          console.error('Error fetching orders:', ordersError);
          setOrders([]);
        }
      }
      
      console.log('=== MY ACCOUNT: FETCH CUSTOMER DATA SUCCESS ===');
    } catch (error) {
      console.error('Error fetching customer data:', error);
      // If fetch fails, fall back to user store data
      if (user) {
        setBillingForm({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          company: user.billing_company || '',
          address_1: user.billing_address_1 || '',
          address_2: user.billing_address_2 || '',
          city: user.billing_city || '',
          state: user.billing_state || '',
          postcode: user.billing_postcode || '',
          country: user.billing_country || 'IN',
          phone: user.billing_phone || '',
          email: user.email || ''
        });
        
        setShippingForm({
          first_name: user.shipping_first_name || user.first_name || '',
          last_name: user.shipping_last_name || user.last_name || '',
          company: user.shipping_company || '',
          address_1: user.shipping_address_1 || '',
          address_2: user.shipping_address_2 || '',
          city: user.shipping_city || '',
          state: user.shipping_state || '',
          postcode: user.shipping_postcode || '',
          country: user.shipping_country || 'IN',
          phone: user.shipping_phone || '',
          email: user.shipping_email || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBillingEdit = () => {
    setEditingBilling(true);
  };

  const handleBillingCancel = () => {
    setEditingBilling(false);
    // Reset form to current user data
    if (user) {
      setBillingForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        company: user.billing_company || '',
        address_1: user.billing_address_1 || '',
        address_2: user.billing_address_2 || '',
        city: user.billing_city || '',
        state: user.billing_state || '',
        postcode: user.billing_postcode || '',
        country: user.billing_country || 'IN',
        phone: user.billing_phone || '',
        email: user.email || ''
      });
    }
  };

  const handleShippingEdit = () => {
    setEditingShipping(true);
  };

  const handleShippingCancel = () => {
    setEditingShipping(false);
    // Reset form to current user data
    if (user) {
      setShippingForm({
        first_name: user.shipping_first_name || user.first_name || '',
        last_name: user.shipping_last_name || user.last_name || '',
        company: user.shipping_company || '',
        address_1: user.shipping_address_1 || '',
        address_2: user.shipping_address_2 || '',
        city: user.shipping_city || '',
        state: user.shipping_state || '',
        postcode: user.shipping_postcode || '',
        country: user.shipping_country || 'IN',
        phone: user.shipping_phone || user.billing_phone || '',
        email: user.shipping_email || user.email || ''
      });
    }
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    console.log('=== MY ACCOUNT: HANDLE BILLING SUBMIT START ===');
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('User object:', JSON.stringify(user, null, 2));
      
      if (!user || !user.id) {
        console.error('ERROR: User ID not found');
        throw new Error('User ID not found');
      }

      console.log('User ID:', user.id);
      console.log('Billing form data:', JSON.stringify(billingForm, null, 2));

      if (!isChennaiCity(billingForm.city)) {
        setMessage({ type: 'error', text: 'Sorry, delivery is only available within Chennai.' });
        setSaving(false);
        return;
      }

      const customerData = {
        billing: billingForm
      };

      console.log('Customer data payload:', JSON.stringify(customerData, null, 2));

      const updatedCustomer = await updateCustomer(customerData);
      
      console.log('Updated customer response:', JSON.stringify(updatedCustomer, null, 2));
      
      // Update user store with new data
      const updatedUser = {
        ...user,
        first_name: updatedCustomer.billing.first_name,
        last_name: updatedCustomer.billing.last_name,
        email: updatedCustomer.billing.email,
        ...updatedCustomer.billing,
        billing_address_1: updatedCustomer.billing.address_1,
        billing_city: updatedCustomer.billing.city,
        billing_state: updatedCustomer.billing.state,
        billing_postcode: updatedCustomer.billing.postcode,
        billing_phone: updatedCustomer.billing.phone,
        billing_email: updatedCustomer.billing.email,
        shipping_address_1: updatedCustomer.shipping.address_1,
        shipping_city: updatedCustomer.shipping.city,
        shipping_state: updatedCustomer.shipping.state,
        shipping_postcode: updatedCustomer.shipping.postcode
      };
      
      console.log('Updated user object for store:', JSON.stringify(updatedUser, null, 2));
      setUser(updatedUser);
      console.log('User store updated with new billing address');

      setMessage({ type: 'success', text: 'Billing address updated successfully!' });
      setEditingBilling(false);
      
      // Refresh customer data from backend to confirm persistence
      console.log('Refreshing customer data from backend to confirm persistence...');
      await fetchCustomerData();
      
      console.log('=== MY ACCOUNT: HANDLE BILLING SUBMIT SUCCESS ===');
    } catch (error) {
      console.error('=== MY ACCOUNT: HANDLE BILLING SUBMIT ERROR ===');
      console.error('Error updating billing address:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update billing address. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    console.log('=== MY ACCOUNT: HANDLE SHIPPING SUBMIT START ===');
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (!user || !user.id) {
        console.error('ERROR: User ID not found');
        throw new Error('User ID not found');
      }

      console.log('Shipping form data:', JSON.stringify(shippingForm, null, 2));

      if (!isChennaiCity(shippingForm.city)) {
        setMessage({ type: 'error', text: 'Sorry, delivery is only available within Chennai.' });
        setSaving(false);
        return;
      }

      const customerData = {
        shipping: shippingForm
      };

      console.log('Customer data payload:', JSON.stringify(customerData, null, 2));

      const updatedCustomer = await updateCustomer(customerData);
      
      console.log('Updated customer response:', JSON.stringify(updatedCustomer, null, 2));
      
      // Update user store with new data
      const updatedUser = {
        ...user,
        shipping_first_name: updatedCustomer.shipping.first_name,
        shipping_last_name: updatedCustomer.shipping.last_name,
        shipping_company: updatedCustomer.shipping.company,
        shipping_address_1: updatedCustomer.shipping.address_1,
        shipping_address_2: updatedCustomer.shipping.address_2,
        shipping_city: updatedCustomer.shipping.city,
        shipping_state: updatedCustomer.shipping.state,
        shipping_postcode: updatedCustomer.shipping.postcode,
        shipping_country: updatedCustomer.shipping.country,
        shipping_phone: updatedCustomer.shipping.phone,
        shipping_email: updatedCustomer.shipping.email || shippingForm.email || ''
      };
      
      console.log('Updated user object for store:', JSON.stringify(updatedUser, null, 2));
      setUser(updatedUser);
      console.log('User store updated with new shipping address');

      setMessage({ type: 'success', text: 'Shipping address updated successfully!' });
      setEditingShipping(false);
      
      // Refresh customer data
      console.log('Refreshing customer data from backend to confirm persistence...');
      await fetchCustomerData();
      
      console.log('=== MY ACCOUNT: HANDLE SHIPPING SUBMIT SUCCESS ===');
    } catch (error) {
      console.error('=== MY ACCOUNT: HANDLE SHIPPING SUBMIT ERROR ===');
      console.error('Error updating shipping address:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update shipping address. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (!user) {
        throw new Error('User not found');
      }

      const customerData = {
        billing: {
          first_name: accountForm.first_name,
          last_name: accountForm.last_name,
          email: accountForm.email,
          company: user.billing_company || '',
          address_1: user.billing_address_1 || '',
          address_2: user.billing_address_2 || '',
          city: user.billing_city || '',
          state: user.billing_state || '',
          postcode: user.billing_postcode || '',
          country: user.billing_country || 'IN',
          phone: user.billing_phone || ''
        }
      };

      const updatedCustomer = await updateCustomer(customerData);
      
      // Update user store with new data from response
      setUser({
        ...user,
        first_name: updatedCustomer.billing.first_name,
        last_name: updatedCustomer.billing.last_name,
        email: updatedCustomer.billing.email || user.email,
        billing_email: updatedCustomer.billing.email || user.billing_email || ''
      });

      setMessage({ type: 'success', text: 'Account details updated successfully!' });
      
      // Refresh customer data
      await fetchCustomerData();
    } catch (error) {
      console.error('Error updating account details:', error);
      setMessage({ type: 'error', text: 'Failed to update account details. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout title="My Account | Ritchie Street" description="Manage your Ritchie Street customer account, orders, addresses, and account details.">
      <main style={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Account Header */}
          <AccountHeader 
            user={user}
            onEditProfile={() => setActiveTab('profile')}
            onLogout={handleLogout}
          />

          {/* Message Banner */}
          {message.text && (
            <div style={{
              padding: '16px 24px',
              marginBottom: '24px',
              borderRadius: '12px',
              backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: message.type === 'success' ? '#16a34a' : '#dc2626',
              border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {message.type === 'success' ? '✅' : '⚠️'} {message.text}
            </div>
          )}

          {/* Account Tabs */}
          <AccountTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <StatsCard 
                  icon="📦" 
                  label="Total Orders" 
                  value={orders.length}
                  color="#f15b29"
                />
                <StatsCard 
                  icon="⏳" 
                  label="Pending Orders" 
                  value={orders.filter(o => o.status === 'pending').length}
                  color="#f15b29"
                />
                <StatsCard 
                  icon="✅" 
                  label="Completed Orders" 
                  value={orders.filter(o => o.status === 'completed').length}
                  color="#16a34a"
                />
                <StatsCard 
                  icon="📍" 
                  label="Saved Addresses" 
                  value={(user?.billing_address_1 ? 1 : 0) + (user?.shipping_address_1 ? 1 : 0)}
                  color="#2563eb"
                />
              </div>

              {/* Recent Orders */}
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 20px 0'
                }}>
                  Recent Orders
                </h3>
                {loading ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b'
                  }}>
                    Loading orders...
                  </div>
                ) : orders.length > 0 ? (
                  <div>
                    {orders.slice(0, 5).map(order => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#94a3b8'
                  }}>
                    <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📦</span>
                    <p style={{
                      fontSize: '16px',
                      margin: '0 0 16px 0'
                    }}>
                      No orders yet
                    </p>
                    <button
                      onClick={() => navigate('/products')}
                      style={{
                        padding: '12px 24px',
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
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0'
              }}>
                All Orders
              </h3>
              {loading ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#64748b'
                }}>
                  Loading orders...
                </div>
              ) : orders.length > 0 ? (
                <div>
                  {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#94a3b8'
                }}>
                  <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>📦</span>
                  <p style={{
                    fontSize: '16px',
                    margin: '0 0 16px 0'
                  }}>
                    No orders yet
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    style={{
                      padding: '12px 24px',
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
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 20px 0'
              }}>
                Manage Addresses
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                <AddressCard
                  title="Billing Address"
                  type="billing"
                  address={{
                    first_name: user?.first_name,
                    last_name: user?.last_name,
                    company: user?.billing_company,
                    address_1: user?.billing_address_1,
                    address_2: user?.billing_address_2,
                    city: user?.billing_city,
                    state: user?.billing_state,
                    postcode: user?.billing_postcode,
                    phone: user?.billing_phone,
                    email: user?.email
                  }}
                  isEditing={editingBilling}
                  onEdit={handleBillingEdit}
                  onAdd={handleBillingEdit}
                >
                  <form onSubmit={handleBillingSubmit} style={{ marginTop: '15px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>First Name *</label>
                      <input
                        type="text"
                        value={billingForm.first_name}
                        onChange={(e) => setBillingForm({ ...billingForm, first_name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Last Name *</label>
                      <input
                        type="text"
                        value={billingForm.last_name}
                        onChange={(e) => setBillingForm({ ...billingForm, last_name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Company</label>
                      <input
                        type="text"
                        value={billingForm.company}
                        onChange={(e) => setBillingForm({ ...billingForm, company: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Address Line 1 *</label>
                      <input
                        type="text"
                        value={billingForm.address_1}
                        onChange={(e) => setBillingForm({ ...billingForm, address_1: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Address Line 2</label>
                      <input
                        type="text"
                        value={billingForm.address_2}
                        onChange={(e) => setBillingForm({ ...billingForm, address_2: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>City *</label>
                      <input
                        type="text"
                        value={billingForm.city}
                        onChange={(e) => setBillingForm({ ...billingForm, city: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>State *</label>
                      <input
                        type="text"
                        value={billingForm.state}
                        onChange={(e) => setBillingForm({ ...billingForm, state: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Postcode *</label>
                      <input
                        type="text"
                        value={billingForm.postcode}
                        onChange={(e) => setBillingForm({ ...billingForm, postcode: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Phone</label>
                      <input
                        type="text"
                        value={billingForm.phone}
                        onChange={(e) => setBillingForm({ ...billingForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email *</label>
                      <input
                        type="email"
                        value={billingForm.email}
                        onChange={(e) => setBillingForm({ ...billingForm, email: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#f15b29',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.5 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={handleBillingCancel}
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ffffff',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.5 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </AddressCard>

                <AddressCard
                  title="Shipping Address"
                  type="shipping"
                  address={{
                    first_name: user?.shipping_first_name || user?.first_name,
                    last_name: user?.shipping_last_name || user?.last_name,
                    company: user?.shipping_company,
                    address_1: user?.shipping_address_1,
                    address_2: user?.shipping_address_2,
                    city: user?.shipping_city,
                    state: user?.shipping_state,
                    postcode: user?.shipping_postcode,
                    phone: user?.shipping_phone,
                    email: user?.shipping_email
                  }}
                  isEditing={editingShipping}
                  onEdit={handleShippingEdit}
                  onAdd={handleShippingEdit}
                >
                  <form onSubmit={handleShippingSubmit} style={{ marginTop: '15px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>First Name *</label>
                      <input
                        type="text"
                        value={shippingForm.first_name}
                        onChange={(e) => setShippingForm({ ...shippingForm, first_name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Last Name *</label>
                      <input
                        type="text"
                        value={shippingForm.last_name}
                        onChange={(e) => setShippingForm({ ...shippingForm, last_name: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Company</label>
                      <input
                        type="text"
                        value={shippingForm.company}
                        onChange={(e) => setShippingForm({ ...shippingForm, company: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Address Line 1 *</label>
                      <input
                        type="text"
                        value={shippingForm.address_1}
                        onChange={(e) => setShippingForm({ ...shippingForm, address_1: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Address Line 2</label>
                      <input
                        type="text"
                        value={shippingForm.address_2}
                        onChange={(e) => setShippingForm({ ...shippingForm, address_2: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>City *</label>
                      <input
                        type="text"
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>State *</label>
                      <input
                        type="text"
                        value={shippingForm.state}
                        onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Postcode *</label>
                      <input
                        type="text"
                        value={shippingForm.postcode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postcode: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Phone</label>
                      <input
                        type="text"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email *</label>
                      <input
                        type="email"
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#f15b29',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.5 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {saving ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={handleShippingCancel}
                        disabled={saving}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: '#ffffff',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          opacity: saving ? 0.5 : 1,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </AddressCard>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              padding: '32px',
              maxWidth: '600px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 24px 0'
              }}>
                Account Details
              </h3>
              <form onSubmit={handleAccountSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>First Name</label>
                  <input
                    type="text"
                    value={accountForm.first_name}
                    onChange={(e) => setAccountForm({ ...accountForm, first_name: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Last Name</label>
                  <input
                    type="text"
                    value={accountForm.last_name}
                    onChange={(e) => setAccountForm({ ...accountForm, last_name: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s' }}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Email</label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.3s' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '14px 32px',
                    backgroundColor: '#f15b29',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default MyAccount;
