import axios from "axios";

const server = axios.create({
  imageURL: "http://180.235.121.59:8001",
  baseURL: "/",
});

server.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default server;
