import { io, Socket } from "socket.io-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

let socket: Socket | null = null;

export function connectSocket(accessToken: string) {
  if (socket?.connected) return socket;

  socket = io(`${API_BASE}/azeyo`, {
    auth: { token: accessToken },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 3000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
