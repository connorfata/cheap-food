// src/utils/faviconUtils.js

/**
 * Extracts domain from a URL
 * @param {string} url - The full URL
 * @returns {string|null} - The domain (e.g., "example.com") or null if invalid
 */
export function extractDomain(url) {
    if (!url || typeof url !== 'string') return null;
    
    try {
      // Handle URLs with or without protocol
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(urlWithProtocol);
      return urlObj.hostname.replace(/^www\./, ''); // Remove www. prefix
    } catch (error) {
      console.warn('Invalid URL for domain extraction:', url, error.message);
      return null;
    }
  }
  
  /**
   * Generates favicon URL using Google's favicon service
   * @param {string} websiteUrl - Restaurant website URL
   * @param {number} size - Favicon size (default: 32)
   * @returns {string|null} - Favicon URL or null if invalid
   */
  export function getFaviconUrl(websiteUrl, size = 32) {
    if (!websiteUrl) return null;
    
    const domain = extractDomain(websiteUrl);
    if (!domain) return null;
    
    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`;
  }
  
  /**
   * Gets alternative favicon URL for fallback
   * @param {string} websiteUrl - Restaurant website URL
   * @returns {string|null} - Alternative favicon URL or null if invalid
   */
  export function getAlternativeFaviconUrl(websiteUrl) {
    if (!websiteUrl) return null;
    
    const domain = extractDomain(websiteUrl);
    if (!domain) return null;
    
    // Alternative favicon service (DuckDuckGo)
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  }
  
  /**
   * Generates multiple favicon URLs with fallbacks
   * @param {string} websiteUrl - Restaurant website URL
   * @param {number} size - Favicon size (default: 32)
   * @returns {object|null} - Object with multiple favicon service URLs or null if invalid
   */
  export function getFaviconUrls(websiteUrl, size = 32) {
    if (!websiteUrl) return null;
    
    const domain = extractDomain(websiteUrl);
    if (!domain) return null;
    
    return {
      google: `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}`,
      faviconkit: `https://api.faviconkit.com/${domain}/${size}`,
      duckduckgo: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      fallback: `https://www.google.com/s2/favicons?sz=${size}&domain=${domain}` // Default to Google
    };
  }
  
  /**
   * Creates a fallback cuisine icon based on restaurant type
   * @param {string} cuisine - Restaurant cuisine type
   * @returns {string} - Emoji or icon for the cuisine
   */
  export function getCuisineIcon(cuisine) {
    if (!cuisine || typeof cuisine !== 'string') {
      return '🍽️'; // Default restaurant icon
    }
    
    const cuisineIcons = {
      'pizza': '🍕',
      'chinese': '🥟',
      'italian': '🍝',
      'mexican': '🌮',
      'indian': '🍛',
      'thai': '🍜',
      'japanese': '🍣',
      'korean': '🍲',
      'american': '🍔',
      'middle eastern': '🥙',
      'mediterranean': '🫒',
      'deli': '🥪',
      'bakery': '🥖',
      'cafe': '☕',
      'fast food': '🍟',
      'burger': '🍔',
      'burgers': '🍔',
      'sandwich': '🥪',
      'sandwiches': '🥪',
      'seafood': '🦐',
      'steakhouse': '🥩',
      'bbq': '🍖',
      'barbecue': '🍖',
      'vegetarian': '🥗',
      'vegan': '🌱',
      'sushi': '🍣',
      'ramen': '🍜',
      'noodles': '🍜',
      'tacos': '🌮',
      'burritos': '🌯',
      'greek': '🥙',
      'turkish': '🥙',
      'lebanese': '🥙',
      'halal': '🥙',
      'kosher': '🥪',
      'wings': '🍗',
      'chicken': '🍗',
      'salad': '🥗',
      'soup': '🍲',
      'breakfast': '🥞',
      'brunch': '🥞',
      'dessert': '🍰',
      'ice cream': '🍦',
      'donuts': '🍩',
      'bagels': '🥯'
    };
    
    const cuisineKey = cuisine.toLowerCase().trim();
    
    // Check for exact matches first
    if (cuisineIcons[cuisineKey]) {
      return cuisineIcons[cuisineKey];
    }
    
    // Check for partial matches
    for (const [key, icon] of Object.entries(cuisineIcons)) {
      if (cuisineKey.includes(key) || key.includes(cuisineKey)) {
        return icon;
      }
    }
    
    return '🍽️'; // Default restaurant icon
  }