import axios from "axios";

const API = axios.create({
  baseURL: "https://my-service-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if ((config.method === "post" || config.method === "put") && config.data) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// On 401 (expired/invalid token), clear storage and send user to login.
// Skip redirect for login request so wrong-password shows toast instead of reloading.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest =
        error.config?.url === "/user/login" ||
        (error.config?.url && error.config.url.endsWith("/user/login"));
      if (!isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
