/**
 * HTML Entity Decoder Utility
 * Safely decodes HTML entities to their character equivalents
 * Common entities: &#038; → &, &amp; → &, &quot; → ", &#39; → ', &lt; → <, &gt; → >
 */

/**
 * Decode HTML entities in a string
 * Uses DOM-based approach for comprehensive entity support
 * @param {string} str - The string with HTML entities
 * @returns {string} - The decoded string
 */
export const decodeHTMLEntities = (str) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // Create a temporary textarea element to decode entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  const decoded = textarea.value;
  
  // Clean up
  textarea.remove();
  
  return decoded;
};

/**
 * Decode HTML entities and sanitize for safe display
 * This prevents XSS while still decoding entities
 * @param {string} str - The string with HTML entities
 * @returns {string} - The decoded and sanitized string
 */
export const safeDecodeHTMLEntities = (str) => {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // First decode the entities
  const decoded = decodeHTMLEntities(str);
  
  // Then escape any remaining HTML tags to prevent XSS
  // This ensures that even if the decoded content contains HTML tags,
  // they won't be rendered as HTML
  const div = document.createElement('div');
  div.textContent = decoded;
  const sanitized = div.innerHTML;
  
  // Clean up
  div.remove();
  
  return sanitized;
};
