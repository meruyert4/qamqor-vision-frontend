const API_BASE_URL = "http://localhost:8080";

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: "/api/v1/login",
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

