/**
 * Helper functions for Price Intelligence features
 */

/**
 * Check if a product has competitor URLs configured for price comparison
 * @param {Object} product - The product object with meta_data
 * @returns {boolean} - True if at least one competitor URL exists
 */
export const hasCompetitorUrls = (product) => {
  if (!product || !product.meta_data) {
    return false;
  }

  const amazonUrl = product.meta_data['_ritchie_pi_amazon_url'];
  const flipkartUrl = product.meta_data['_ritchie_pi_flipkart_url'];

  return !!(amazonUrl || flipkartUrl);
};

/**
 * Get competitor URLs from product meta data
 * @param {Object} product - The product object with meta_data
 * @returns {Object} - Object containing Amazon and Flipkart URLs
 */
export const getCompetitorUrls = (product) => {
  if (!product || !product.meta_data) {
    return { amazon: null, flipkart: null };
  }

  return {
    amazon: product.meta_data['_ritchie_pi_amazon_url'] || null,
    flipkart: product.meta_data['_ritchie_pi_flipkart_url'] || null
  };
};