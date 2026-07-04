import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://ritchiestreet.co.in/demo/engaArea/wp-json/wc/store';
const CONSUMER_KEY = process.env.REACT_APP_WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.REACT_APP_WC_CONSUMER_SECRET;

// Create axios instance for Store API (no auth needed for public endpoints)
const storeApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance with WooCommerce authentication for admin endpoints
const woocommerceApi = axios.create({
  baseURL: 'https://ritchiestreet.co.in/demo/engaArea/wp-json/wc/v3',
  params: {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Products API
export const getProducts = async (params = {}) => {
  try {
    const response = await storeApi.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const response = await storeApi.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await storeApi.get('/products', {
      params: { ...params, category: categoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Categories API
export const getCategories = async (params = {}) => {
  try {
    const response = await storeApi.get('/products/categories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getCategory = async (id) => {
  try {
    const response = await storeApi.get(`/products/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Cart API (WooCommerce session-based cart)
export const getCart = async () => {
  try {
    const response = await woocommerceApi.get('/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const response = await woocommerceApi.post('/cart/add', {
      product_id: productId,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (key, quantity) => {
  try {
    const response = await woocommerceApi.post('/cart/update', {
      key,
      quantity
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (key) => {
  try {
    const response = await woocommerceApi.post('/cart/remove', { key });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await woocommerceApi.post('/cart/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Orders API - Using custom WordPress endpoint for secure order creation
export const createOrder = async (orderData) => {
  try {
    console.log('=== CUSTOM ORDER API: CREATE ORDER START ===');
    const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'https://ritchiestreet.co.in/demo/engaArea/';
    const customApiUrl = `${WP_URL}/wp-json/custom/v1/create-order`;
    
    console.log('Custom API URL:', customApiUrl);
    console.log('Request payload:', JSON.stringify(orderData, null, 2));
    
    const response = await axios.post(customApiUrl, orderData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('=== CUSTOM ORDER API: CREATE ORDER SUCCESS ===');
    
    return response.data;
  } catch (error) {
    console.error('=== CUSTOM ORDER API: CREATE ORDER ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error response headers:', error.response?.headers);
    console.error('Request config:', error.config);
    throw error;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await woocommerceApi.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const getOrders = async (customerId) => {
  try {
    console.log('=== WOOCOMMERCE API: GET ORDERS START ===');
    console.log('Customer ID:', customerId);
    
    const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'https://ritchiestreet.co.in/demo/engaArea/';
    const customApiUrl = `${WP_URL}/wp-json/custom/v1/get-orders`;
    
    console.log('Custom API URL:', customApiUrl);
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    console.log('Token found:', token.substring(0, 20) + '...');
    
    const response = await axios.post(customApiUrl, { customer_id: customerId }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('=== WOOCOMMERCE API: GET ORDERS SUCCESS ===');
    
    return response.data;
  } catch (error) {
    console.error('=== WOOCOMMERCE API: GET ORDERS ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Request config:', error.config);
    throw error;
  }
};

// Customers API
export const getCustomer = async (id) => {
  try {
    console.log('=== WOOCOMMERCE API: GET CUSTOMER START ===');
    console.log('Customer ID:', id);
    
    const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'https://ritchiestreet.co.in/demo/engaArea/';
    const customApiUrl = `${WP_URL}/wp-json/custom/v1/get-customer`;
    
    console.log('Custom API URL:', customApiUrl);
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    console.log('Token found:', token.substring(0, 20) + '...');
    
    const response = await axios.post(customApiUrl, { customer_id: id }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('=== WOOCOMMERCE API: GET CUSTOMER SUCCESS ===');
    
    return response.data;
  } catch (error) {
    console.error('=== WOOCOMMERCE API: GET CUSTOMER ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Request config:', error.config);
    throw error;
  }
};

export const createCustomer = async (customerData) => {
  try {
    const response = await woocommerceApi.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (customerData) => {
  try {
    console.log('=== UPDATE CUSTOMER START ===');
    console.log('Customer Data:', JSON.stringify(customerData, null, 2));
    
    const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'https://ritchiestreet.co.in/demo/engaArea/';
    const customApiUrl = `${WP_URL}/wp-json/custom/v1/update-customer`;
    
    console.log('Custom API URL:', customApiUrl);
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    console.log('Token found:', token.substring(0, 20) + '...');
    
    const response = await axios.post(customApiUrl, customerData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    console.log('=== UPDATE CUSTOMER SUCCESS ===');
    
    return response.data;
  } catch (error) {
    console.error('=== UPDATE CUSTOMER ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Request config:', error.config);
    throw error;
  }
};

// Reviews API
export const getProductReviews = async (productId) => {
  try {
    const response = await woocommerceApi.get('/products/reviews', {
      params: { product_id: productId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await woocommerceApi.post('/products/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export default woocommerceApi;
