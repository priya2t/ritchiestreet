import axios from 'axios';

const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress';
const STORE_API_URL = `${WP_URL}/wp-json/wc/store`;
const CONSUMER_KEY = process.env.REACT_APP_WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.REACT_APP_WC_CONSUMER_SECRET;

// Create axios instance for Store API (no auth needed for public endpoints)
const storeApi = axios.create({
  baseURL: STORE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create axios instance with WooCommerce authentication for admin endpoints
const woocommerceApi = axios.create({
  baseURL: `${WP_URL}/wp-json/wc/v3`,
  params: {
    consumer_key: CONSUMER_KEY,
    consumer_secret: CONSUMER_SECRET
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const apiCache = new Map();
const apiInFlight = new Map();

const cachedGet = (cacheKey, fetcher) => {
  const now = Date.now();
  const cached = apiCache.get(cacheKey);
  if (cached && now - cached.ts < API_CACHE_TTL) {
    return Promise.resolve(cached.data);
  }
  const inFlight = apiInFlight.get(cacheKey);
  if (inFlight) return inFlight;

  const promise = fetcher().then(data => {
    apiCache.set(cacheKey, { data, ts: Date.now() });
    apiInFlight.delete(cacheKey);
    return data;
  }).catch(err => {
    apiInFlight.delete(cacheKey);
    throw err;
  });
  apiInFlight.set(cacheKey, promise);
  return promise;
};

// Products API
export const getProducts = async (params = {}) => {
  const requestParams = { per_page: 100, ...params };
  console.log('=== WOOCOMMERCE API: getProducts ===');
  console.log('Request params:', requestParams);
  
  try {
    const data = await cachedGet(`products:${JSON.stringify(requestParams)}`, () =>
      storeApi.get('/products', { params: requestParams }).then(res => res.data)
    );
    
    // Fetch competitor URLs for all products
    const productIds = data.map(p => p.id).join(',');
    if (productIds) {
      try {
        const metaResponse = await axios.get(`${WP_URL}/wp-json/custom/v1/batch-product-meta?product_ids=${productIds}`);
        if (metaResponse.data && metaResponse.data.success) {
          const metaMap = metaResponse.data.meta_data || {};
          data.forEach(product => {
            product.meta_data = metaMap[product.id] || {};
          });
        } else {
          data.forEach(product => {
            product.meta_data = {};
          });
        }
      } catch (error) {
        console.warn('Failed to fetch batch product meta:', error);
        data.forEach(product => {
          product.meta_data = {};
        });
      }
    } else {
      data.forEach(product => {
        product.meta_data = {};
      });
    }
    
    console.log('Products fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};



export const getProduct = async (id) => {
  const product = await cachedGet(`product:${id}`, () =>
    storeApi.get(`/products/${id}`).then(res => res.data)
  );
  
  // Fetch competitor URLs from custom API
  try {
    const metaResponse = await axios.get(`${WP_URL}/wp-json/custom/v1/product-meta/${id}`);
    if (metaResponse.data && metaResponse.data.success) {
      product.meta_data = metaResponse.data.meta_data;
    } else {
      product.meta_data = {};
    }
  } catch (error) {
    console.warn('Failed to fetch product meta:', error);
    product.meta_data = {};
  }
  
  return product;
};

export const getProductsByCategory = async (categoryId, params = {}) => {
  const requestParams = { per_page: 12, page: 1, ...params, category: categoryId };
  console.log('=== WOOCOMMERCE API: getProductsByCategory ===');
  console.log('Category ID:', categoryId);
  console.log('Request params:', requestParams);
  
  try {
    const result = await cachedGet(`products-category:${categoryId}:${JSON.stringify(requestParams)}`, () =>
      storeApi.get('/products', { params: requestParams }).then(res => ({
        data: res.data,
        headers: res.headers
      }))
    );
    
    const data = result.data;
    
    // Fetch competitor URLs for all products
    const productIds = data.map(p => p.id).join(',');
    if (productIds) {
      try {
        const metaResponse = await axios.get(`${WP_URL}/wp-json/custom/v1/batch-product-meta?product_ids=${productIds}`);
        if (metaResponse.data && metaResponse.data.success) {
          const metaMap = metaResponse.data.meta_data || {};
          data.forEach(product => {
            product.meta_data = metaMap[product.id] || {};
          });
        } else {
          data.forEach(product => {
            product.meta_data = {};
          });
        }
      } catch (error) {
        console.warn('Failed to fetch batch product meta:', error);
        data.forEach(product => {
          product.meta_data = {};
        });
      }
    } else {
      data.forEach(product => {
        product.meta_data = {};
      });
    }
    
    // Extract pagination info from headers
    const total = parseInt(result.headers['x-wp-total'] || '0');
    const totalPages = parseInt(result.headers['x-wp-totalpages'] || '1');
    
    console.log('Products fetched:', data.length);
    console.log('Total products:', total);
    console.log('Total pages:', totalPages);
    
    return {
      products: data,
      total,
      totalPages,
      currentPage: parseInt(requestParams.page || '1'),
      perPage: parseInt(requestParams.per_page || '12')
    };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getProductsByAttribute = async (attributeName, attributeValue, params = {}) => {
  // Note: This function is deprecated - use getProductsWithAttributeFilter with IDs instead
  console.warn('getProductsByAttribute is deprecated. Use getProductsWithAttributeFilter with attribute ID and term ID.');
  const requestParams = { 
    per_page: 100, 
    ...params,
    attribute: attributeName,
    attribute_term: attributeValue
  };
  return cachedGet(`products-attribute:${attributeName}:${attributeValue}:${JSON.stringify(params)}`, () =>
    woocommerceApi.get('/products', { params: requestParams }).then(res => res.data)
  );
};

export const getCategoryBySlug = async (slug) => {
  const requestParams = { slug, per_page: 1 };
  return cachedGet(`category-slug:${slug}`, () =>
    storeApi.get('/products/categories', { params: requestParams }).then(res => res.data[0])
  );
};

// Product Attributes API
export const getProductAttributes = async (params = {}) => {
  const requestParams = { per_page: 100, ...params };
  console.log('=== WOOCOMMERCE API: getProductAttributes ===');
  console.log('Request params:', requestParams);
  
  try {
    const data = await cachedGet(`product-attributes:${JSON.stringify(requestParams)}`, () =>
      woocommerceApi.get('/products/attributes', { params: requestParams }).then(res => res.data)
    );
    console.log('Attributes fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching product attributes:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getAttributeBySlug = async (slug) => {
  const requestParams = { slug, per_page: 1 };
  console.log('=== WOOCOMMERCE API: getAttributeBySlug ===');
  console.log('Slug:', slug);
  console.log('Request params:', requestParams);
  
  try {
    const data = await cachedGet(`attribute-slug:${slug}`, () =>
      woocommerceApi.get('/products/attributes', { params: requestParams }).then(res => res.data)
    );
    console.log('Attribute found:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error fetching attribute by slug:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getAttributeTerms = async (attributeId, params = {}) => {
  const requestParams = { per_page: 100, ...params };
  console.log('=== WOOCOMMERCE API: getAttributeTerms ===');
  console.log('Attribute ID:', attributeId);
  console.log('Request params:', requestParams);
  
  try {
    const data = await cachedGet(`attribute-terms:${attributeId}:${JSON.stringify(requestParams)}`, () =>
      woocommerceApi.get(`/products/attributes/${attributeId}/terms`, { params: requestParams }).then(res => res.data)
    );
    console.log('Attribute terms fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching attribute terms:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const getAttributeTermBySlug = async (attributeId, slug) => {
  const requestParams = { slug, per_page: 1 };
  console.log('=== WOOCOMMERCE API: getAttributeTermBySlug ===');
  console.log('Attribute ID:', attributeId);
  console.log('Term slug:', slug);
  console.log('Request params:', requestParams);
  
  try {
    const data = await cachedGet(`attribute-term-slug:${attributeId}:${slug}`, () =>
      woocommerceApi.get(`/products/attributes/${attributeId}/terms`, { params: requestParams }).then(res => res.data)
    );
    console.log('Attribute term found:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error fetching attribute term by slug:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Get products with attribute filtering using authenticated API
export const getProductsWithAttribute = async (attributeId, termId, params = {}) => {
  const requestParams = { 
    per_page: 100, 
    ...params,
    attribute: attributeId,
    attribute_term: termId
  };
  console.log('=== WOOCOMMERCE API: getProductsWithAttribute ===');
  console.log('Attribute ID:', attributeId);
  console.log('Term ID:', termId);
  console.log('Request params:', requestParams);
  console.log('Full API URL:', `${WP_URL}/wp-json/wc/v3/products?${new URLSearchParams(requestParams).toString()}`);
  
  try {
    const data = await cachedGet(`products-attribute:${attributeId}:${termId}:${JSON.stringify(params)}`, () =>
      woocommerceApi.get('/products', { params: requestParams }).then(res => res.data)
    );
    console.log('Products fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching products with attribute:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Categories API
export const getCategories = async (params = {}) => {
  const requestParams = { per_page: 100, hide_empty: true, ...params };
  return cachedGet(`categories:${JSON.stringify(requestParams)}`, () =>
    storeApi.get('/products/categories', { params: requestParams }).then(res => res.data)
  );
};

export const getCategory = async (id) => {
  return cachedGet(`category:${id}`, () =>
    storeApi.get(`/products/categories/${id}`).then(res => res.data)
  );
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
    // Uses top-level WP_URL
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
    
    // Uses top-level WP_URL
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
    
    // Uses top-level WP_URL
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
    
    // Uses top-level WP_URL
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
