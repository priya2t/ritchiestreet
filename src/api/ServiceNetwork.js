// src/api/ServiceNetwork.js
// API client for the Service Network feature (isolated custom endpoints).
import axios from 'axios';

const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress';
const SN_API = `${WP_URL}/wp-json/custom/v1/sn`;

// Fetch registration fee + payment info for engineer registration
export const getServicePaymentInfo = async () => {
    try {
        const response = await axios.get(`${SN_API}/payment-info`);
        return response.data;
    } catch (error) {
        console.error('Error fetching service payment info:', error);
        return { success: false, fee: 0, currency: 'INR' };
    }
};

// Submit a "Book a Service" request
export const submitServiceBooking = async (formData) => {
    try {
        const response = await axios.post(`${SN_API}/book-service`, formData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting service booking:', error);
        const message = error.response?.data?.message || 'Something went wrong. Please try again.';
        throw new Error(message);
    }
};

// Submit a Service Engineer Registration.
// Accepts either a plain object (sent as JSON) or FormData (sent as
// multipart/form-data so an optional ID proof file can be attached).
export const submitEngineerRegistration = async (formData) => {
    try {
        const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
        const response = await axios.post(`${SN_API}/engineer-register`, formData, {
            // No explicit Content-Type for FormData — axios/browser sets the
            // multipart boundary automatically.
            headers: isFormData ? {} : { 'Content-Type': 'application/json' }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting engineer registration:', error);
        const message = error.response?.data?.message || 'Something went wrong. Please try again.';
        const err = new Error(message);
        err.code = error.response?.data?.code || '';
        throw err;
    }
};
