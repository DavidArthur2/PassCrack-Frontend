const API_CONFIG = {
    BASE_URL: "http://localhost",
    PORT: 8001
};
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}:${API_CONFIG.PORT}${endpoint}`;