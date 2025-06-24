import React from 'react';

// Utility functions for handling data display

/**
 * Safely render location object as string
 * @param {string|object} location - Location data (string or object)
 * @returns {string} - Formatted location string
 */
export const formatLocation = (location) => {
  if (!location) return 'Location not specified';
  
  if (typeof location === 'string') {
    return location;
  }
  
  if (typeof location === 'object') {
    // Full address format
    if (location.address && location.city && location.state) {
      return `${location.address}, ${location.city}, ${location.state}${location.zipCode ? ' ' + location.zipCode : ''}`;
    }
    
    // City, State format
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`;
    }
    
    // Individual components
    if (location.city) return location.city;
    if (location.state) return location.state;
    if (location.address) return location.address;
  }
  
  return 'Location not specified';
};

/**
 * Safely render price with currency formatting
 * @param {number|object} price - Price data
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price, currency = '$') => {
  if (!price) return 'Price on Request';
  
  if (typeof price === 'number') {
    return `${currency}${price.toLocaleString()}`;
  }
  
  if (typeof price === 'object' && price.amount) {
    const symbol = price.currency === 'USD' ? '$' : price.currency || currency;
    return `${symbol}${price.amount.toLocaleString()}`;
  }
  
  return 'Price on Request';
};

/**
 * Safely render salary range
 * @param {object} salary - Salary object with min, max, currency
 * @returns {string} - Formatted salary range string
 */
export const formatSalaryRange = (salary) => {
  if (!salary) return 'Salary not specified';
  
  const currency = salary.currency || 'USD';
  const symbol = currency === 'USD' ? '$' : currency;
  const period = salary.period || 'yearly';
  
  if (salary.min && salary.max) {
    return `${symbol}${salary.min.toLocaleString()} - ${symbol}${salary.max.toLocaleString()} per ${period}`;
  }
  
  if (salary.min) {
    return `${symbol}${salary.min.toLocaleString()}+ per ${period}`;
  }
  
  if (salary.max) {
    return `Up to ${symbol}${salary.max.toLocaleString()} per ${period}`;
  }
  
  return 'Salary not specified';
};

/**
 * Safely render array as comma-separated string
 * @param {array} array - Array of items
 * @param {string} fallback - Fallback text if array is empty
 * @returns {string} - Comma-separated string
 */
export const formatArray = (array, fallback = 'Not specified') => {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return fallback;
  }
  
  return array.filter(Boolean).join(', ');
};

/**
 * Safely render date
 * @param {string|Date} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  if (!date) return 'Date not specified';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    return dateObj.toLocaleDateString(undefined, options);
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Safely access nested object properties
 * @param {object} obj - Object to access
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} - Value at path or default value
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

/**
 * Validate if object can be safely rendered in React
 * @param {any} value - Value to check
 * @returns {boolean} - True if safe to render
 */
export const isSafeToRender = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
  if (React.isValidElement(value)) return true;
  return false;
};

/**
 * Convert any value to safe renderable format
 * @param {any} value - Value to convert
 * @param {string} fallback - Fallback text
 * @returns {string|number|boolean|React.Element} - Safe renderable value
 */
export const toSafeRender = (value, fallback = 'Not available') => {
  if (isSafeToRender(value)) return value;
  
  if (Array.isArray(value)) {
    return formatArray(value, fallback);
  }
  
  if (typeof value === 'object' && value !== null) {
    // Try to extract meaningful string representation
    if (value.name) return value.name;
    if (value.title) return value.title;
    if (value.label) return value.label;
    if (value.text) return value.text;
    if (value.value) return value.value;
    
    // For location objects
    if (value.city || value.state || value.address) {
      return formatLocation(value);
    }
    
    // For other objects, return JSON string as last resort
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  
  return fallback;
};
