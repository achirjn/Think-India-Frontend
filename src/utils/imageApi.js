/**
 * Utility functions for fetching images from the backend API
 */

/**
 * Fetches images from the provided API endpoint
 * @param {string} apiEndpoint - The API endpoint to fetch images from
 * @returns {Promise<Array>} - A promise that resolves to an array of image objects
 */
export const fetchImagesFromApi = async (apiEndpoint) => {
  try {
    const response = await fetch(apiEndpoint);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the response data to match the expected format for the ImageSlider component
    // Adjust the mapping according to your API response structure
    const formattedImages = Array.isArray(data) ? data.map(item => ({
      src: item.imageUrl || item.url || item.src || '',
      alt: item.description || item.alt || 'Image',
      title: item.title || 'Build Better Products'
    })) : [];
    
    return formattedImages;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
};

/**
 * Validates if the provided API endpoint is valid
 * @param {string} apiEndpoint - The API endpoint to validate
 * @returns {boolean} - True if the API endpoint is valid, false otherwise
 */
export const isValidApiEndpoint = (apiEndpoint) => {
  try {
    new URL(apiEndpoint);
    return true;
  } catch (error) {
    return false;
  }
};