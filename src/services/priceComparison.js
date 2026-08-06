import axios from 'axios';

const WP_URL = process.env.REACT_APP_WORDPRESS_URL || 'http://localhost/rich/rich_wordpress';
const CUSTOM_API_URL = `${WP_URL}/wp-json/custom/v1`;

/**
 * Fetch the price comparison data for a product.
 * @param {number|string} productId
 * @returns {Promise<Object>}
 */
export const fetchPriceComparison = async (productId) => {
  const response = await axios.get(`${CUSTOM_API_URL}/price-comparison/${productId}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data?.data || response.data;
};

/**
 * Copy the given text to the clipboard with a secure fallback.
 * @param {string} text
 * @returns {Promise<void>}
 */
export const copyToClipboard = async (text) => {
  if (!text) return;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error('Copy failed:', err);
    throw err;
  }
};
