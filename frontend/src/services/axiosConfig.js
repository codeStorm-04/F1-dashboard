import axios from "axios";

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user data on unauthorized response
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally redirect to login page
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Set default base URL
axios.defaults.baseURL = "http://localhost:5000";

export default axios; 