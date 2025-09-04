// API Configuration
export const config = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
    (import.meta.env.PROD ? 'https://saas-school-management-v2.onrender.com/api' : 'http://localhost:3000/api'),
  // You can add other configuration values here
  // TIMEOUT: 10000,
  // RETRY_ATTEMPTS: 3,
};
