import axios from 'axios';

/**
 * Enterprise-grade Axios instance for MINI Honey
 * Features:
 * - Centralized configuration
 * - Auto-retry for transient network failures
 * - Global error handling with contextual messages
 * - Environment-aware base URL
 */

const baseURL = import.meta.env.VITE_API_URL || '/';

const api = axios.create({
  baseURL,
  timeout: 15000, // Increased timeout for production stability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Auth & Logging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    // Future: Add Authorization: Bearer <token> here
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Retries & Error Normalization
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // Auto-retry logic for network errors or 5xx server errors
    const shouldRetry = (!response || response.status >= 500) && !config._retry;
    
    if (shouldRetry) {
      config._retry = true;
      const retryDelay = 2000;
      console.warn(`[API Retry] Retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return api(config);
    }

    // Standardize error messaging for UI consumption
    const errorDetail = response?.data?.detail || response?.data?.error || error.message;
    const statusCode = response?.status || 'NETWORK_ERROR';
    
    const enhancedError = new Error(errorDetail);
    enhancedError.status = statusCode;
    enhancedError.originalError = error;

    if (import.meta.env.DEV) {
      console.error(`[API Response Error] ${statusCode}: ${errorDetail}`);
    }
    
    return Promise.reject(enhancedError);
  }
);

export default api;
