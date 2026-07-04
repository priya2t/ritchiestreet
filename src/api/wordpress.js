// src/api/wordpress.js
import axios from 'axios';

// WordPress configuration
const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress';
const WP_API = `${WP_URL}/wp-json/wp/v2`;
const WC_API = `${WP_URL}/wp-json/wc/v3`;

// WooCommerce API keys from environment
const CONSUMER_KEY = process.env.REACT_APP_WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.REACT_APP_WC_CONSUMER_SECRET;

// Fetch all products from WooCommerce
export const getProducts = async (page = 1, perPage = 12) => {
    try {
        const response = await axios.get(`${WC_API}/products`, {
            params: {
                consumer_key: CONSUMER_KEY,
                consumer_secret: CONSUMER_SECRET,
                page: page,
                per_page: perPage,
                status: 'publish'
            }
        });
        return {
            products: response.data,
            total: response.headers['x-wp-total'],
            totalPages: response.headers['x-wp-totalpages']
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return { products: [], total: 0, totalPages: 0 };
    }
};

// Fetch single product by ID
export const getProduct = async (id) => {
    try {
        const response = await axios.get(`${WC_API}/products/${id}`, {
            params: {
                consumer_key: CONSUMER_KEY,
                consumer_secret: CONSUMER_SECRET
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
};

// Fetch product categories
export const getCategories = async () => {
    try {
        const response = await axios.get(`${WC_API}/products/categories`, {
            params: {
                consumer_key: CONSUMER_KEY,
                consumer_secret: CONSUMER_SECRET,
                per_page: 100
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// Fetch products by category
export const getProductsByCategory = async (categoryId) => {
    try {
        const response = await axios.get(`${WC_API}/products`, {
            params: {
                consumer_key: CONSUMER_KEY,
                consumer_secret: CONSUMER_SECRET,
                category: categoryId,
                status: 'publish'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        return [];
    }
};

// Fetch WordPress posts/pages
export const getPosts = async () => {
    try {
        const response = await axios.get(`${WP_API}/posts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
};

// Product search using custom WordPress endpoint (no WooCommerce auth required)
export const searchProducts = async (searchTerm, limit = 50) => {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return { success: true, products: [] };
        }
        const response = await axios.get(`${WP_URL}/wp-json/custom/v1/search-products`, {
            params: {
                search: searchTerm.trim(),
                limit
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching products:', error);
        return { success: false, products: [] };
    }
};

// Search product suggestions for live dropdown (top 5)
export const searchSuggestions = async (searchTerm) => {
    try {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return { success: true, products: [] };
        }
        const response = await axios.get(`${WP_URL}/wp-json/custom/v1/search-products`, {
            params: {
                search: searchTerm.trim(),
                suggestions: 5
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return { success: false, products: [] };
    }
};

// Register new WordPress user using custom endpoint
export const registerUser = async (userData) => {
    try {
        console.log('Registration request URL:', `${WP_URL}/wp-json/custom/v1/register`);
        console.log('Registration payload:', userData);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/register`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Registration response status:', response.status);
        console.log('Registration response data:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Send OTP to phone number
export const sendOTP = async (phone) => {
    try {
        console.log('Send OTP request for phone:', phone);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/send-otp`, { phone }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Send OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Verify OTP and login
export const verifyOTP = async (phone, otp) => {
    try {
        console.log('Verify OTP request for phone:', phone);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/verify-otp`, { phone, otp }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Verify OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Send Login OTP (for existing users)
export const sendLoginOTP = async (phone) => {
    try {
        console.log('Send Login OTP request for phone:', phone);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/send-login-otp`, { phone }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Send Login OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending login OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Verify Login OTP and login
export const verifyLoginOTP = async (phone, otp) => {
    try {
        console.log('Verify Login OTP request for phone:', phone);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/verify-login-otp`, { phone, otp }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Verify Login OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying login OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Request Login OTP (for existing users - accepts email or phone)
export const requestLoginOTP = async (identifier) => {
    try {
        console.log('Request Login OTP for identifier:', identifier);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/request-login-otp`, { identifier }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Request Login OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error requesting login OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Verify Login OTP with identifier (email or phone)
export const verifyLoginOTPWithIdentifier = async (identifier, otp) => {
    try {
        console.log('Verify Login OTP for identifier:', identifier);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/verify-login-otp`, { identifier, otp }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Verify Login OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying login OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Request Registration OTP (for new users - accepts email or phone)
export const requestRegistrationOTP = async (identifier) => {
    try {
        console.log('Request Registration OTP for identifier:', identifier);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/request-registration-otp`, { identifier }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Request Registration OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error requesting registration OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Verify Registration OTP with identifier (email or phone)
export const verifyRegistrationOTP = async (identifier, otp) => {
    try {
        console.log('Verify Registration OTP for identifier:', identifier);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/verify-registration-otp`, { identifier, otp }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Verify Registration OTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error verifying registration OTP:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Submit Contact Us form
export const submitContactForm = async (formData) => {
    try {
        console.log('Submit Contact form:', formData);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/submit-contact`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Contact form response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error submitting contact form:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Submit Service Enquiry form
export const submitServiceForm = async (formData) => {
    try {
        console.log('Submit Service form:', formData);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/submit-service`, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Service form response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error submitting service form:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};

// Submit Newsletter subscription
export const submitNewsletter = async (email) => {
    try {
        console.log('Submit Newsletter:', email);
        
        const response = await axios.post(`${WP_URL}/wp-json/custom/v1/submit-newsletter`, {
            email
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Newsletter response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        console.error('Error response status:', error.response?.status);
        console.error('Error response data:', error.response?.data);
        throw error;
    }
};