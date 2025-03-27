import axios from "axios";

const API_URL = "http://localhost:3000/api/f1";

// Add request interceptor for logging
axios.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axios.interceptors.response.use(
  (response) => {
    console.log(`Received response from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const f1Service = {
  // Insert initial F1 data
  async insertInitialData(season) {
    try {
      const response = await axios.post(`${API_URL}/insert-data`, { season });
      console.log("Insert data response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error inserting F1 data:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to insert F1 data"
      );
    }
  },

  // Get Constructors Championship
  async getConstructorsChampionship(year) {
    try {
      const response = await axios.get(
        `${API_URL}/${year}/constructors-championship`
      );
      console.log("Constructors championship response:", response.data);
      if (!response.data || response.data.status !== "success") {
        throw new Error(
          response.data?.message || "Failed to fetch constructors championship"
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching constructors championship:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to fetch constructors championship"
      );
    }
  },

  // Get Drivers Championship
  async getDriversChampionship(year) {
    try {
      const response = await axios.get(
        `${API_URL}/${year}/drivers-championship`
      );
      console.log("Drivers championship response:", response.data);
      if (!response.data || response.data.status !== "success") {
        throw new Error(
          response.data?.message || "Failed to fetch drivers championship"
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching drivers championship:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch drivers championship"
      );
    }
  },

  // Get Practice Session Results
  async getPracticeSession(year, round, session) {
    try {
      const response = await axios.get(
        `${API_URL}/${year}/${round}/${session}`
      );
      console.log("Practice session response:", response.data);
      if (!response.data || response.data.status !== "success") {
        throw new Error(
          response.data?.message || "Failed to fetch practice session"
        );
      }
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching practice session:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch practice session"
      );
    }
  },
};

export default f1Service;
