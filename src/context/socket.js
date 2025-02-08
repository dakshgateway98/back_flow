import io from "socket.io-client";

import React from "react";

// var SOCKET_URL = "http:// localhost:8080";
var SOCKET_URL = "";

export const socket = io.connect(SOCKET_URL, {
  transports: ["websocket"], // use WebSocket first, if available
});

export const SocketContext = React.createContext();
