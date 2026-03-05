import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost/Snake_bite/", // backend URL
});

export default api;