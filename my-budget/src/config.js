
// src/config.js
export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) ||
  '/api';

export const IS_DEV =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV) ||
  (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development');

