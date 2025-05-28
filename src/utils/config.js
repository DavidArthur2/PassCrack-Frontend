const API_CONFIG = {
  BASE_URL: "/api"
};
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

