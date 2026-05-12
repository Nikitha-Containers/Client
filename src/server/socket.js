import { io } from "socket.io-client";

// Same base URL as your axios server — port 8001
const socket = io("http://localhost:8001", {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

socket.on("connect_error", (err) => {
  console.warn("Socket connection error:", err.message);
});

export default socket;
