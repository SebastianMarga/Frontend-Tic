import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/', '')
    : "http://localhost:3002";

export const socket = io(BACKEND_URL, {
    autoConnect: false,
    withCredentials: true,
});