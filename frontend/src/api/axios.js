import axios from "axios";

const api = axios.create({
  baseURL: "https://snakebite-production.up.railway.app/", // backend URL
});

export default api;