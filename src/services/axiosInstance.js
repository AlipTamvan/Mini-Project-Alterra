// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    "HTTP-Referer": window.location.origin,
    "X-Title": "Eco Quiz App",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authorization header to every request
    config.headers.Authorization = `Bearer ${
      import.meta.env.VITE_OPENROUTER_API_KEY
    }`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request Error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
