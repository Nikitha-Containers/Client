import axios from "axios";

const server = axios.create({
  baseURL: "http://localhost:8001/",
});

server.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default server;
