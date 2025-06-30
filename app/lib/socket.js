/**
 * socket.js
 * 
 * PURPOSE: Socket.IO client utility for real-time communication
 * 
 * FUNCTIONALITY:
 * - Manages Socket.IO client connection to the server
 * - Implements singleton pattern to prevent multiple connections
 * - Provides event handling for real-time updates
 * - Handles connection errors and reconnection
 * 
 * KEY FEATURES:
 * - Singleton Socket.IO client instance
 * - Automatic reconnection on connection loss
 * - Event listener management
 * - Connection status tracking
 * - Error handling and logging
 * 
 * SOCKET EVENTS:
 * - user_added: When a new user is added to the system
 * - user_deleted: When a user is removed from the system
 * - sensor_update: When sensor data is updated
 * - alert_triggered: When a new flood alert is triggered
 * 
 * CONNECTION DETAILS:
 * - Server URL: http://localhost:4000
 * - Transport: WebSocket with polling fallback
 * - Auto-reconnect: Enabled
 * - Reconnection delay: 1000ms
 * 
 * DEPENDENCIES:
 * - Socket.IO client library
 * - Real-time server running on port 4000
 */

import { io } from "socket.io-client"; // Import Socket.IO client

// Singleton socket instance
let socket = null; // Variable to hold the socket instance

// Socket.IO client configuration
const SOCKET_CONFIG = {
  url: "https://rainalert-web.onrender.com", // Socket server URL
  options: {
    transports: ["websocket", "polling"], // Transport methods in order of preference
    autoConnect: true, // Automatically connect when socket is created
    reconnection: true, // Enable automatic reconnection
    reconnectionDelay: 1000, // Delay between reconnection attempts (1 second)
    reconnectionAttempts: 5, // Maximum number of reconnection attempts
    timeout: 20000, // Connection timeout (20 seconds)
  }
};

// Function to get or create socket instance (singleton pattern)
export function getSocket() {
  // If socket doesn't exist or is disconnected, create new connection
  if (!socket || !socket.connected) {
    try {
      // Create new Socket.IO client instance
      socket = io(SOCKET_CONFIG.url, SOCKET_CONFIG.options);
      
      // Set up connection event handlers
      setupSocketEventHandlers(socket);
      
      // Log successful connection
      console.log("Socket.IO client connected to server");
      
    } catch (error) { // If socket creation failed
      // Log connection error
      console.error("Failed to create Socket.IO connection:", error);
      
      // Return null if connection failed
      return null;
    }
  }
  
  // Return existing or newly created socket instance
  return socket;
}

// Function to set up socket event handlers
function setupSocketEventHandlers(socketInstance) {
  // Connection event handlers
  socketInstance.on("connect", () => {
    console.log("Connected to Socket.IO server"); // Log successful connection
  });
  
  socketInstance.on("disconnect", (reason) => {
    console.log("Disconnected from Socket.IO server:", reason); // Log disconnection
  });
  
  socketInstance.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error); // Log connection errors
  });
  
  socketInstance.on("reconnect", (attemptNumber) => {
    console.log("Reconnected to Socket.IO server after", attemptNumber, "attempts"); // Log reconnection
  });
  
  socketInstance.on("reconnect_error", (error) => {
    console.error("Socket.IO reconnection error:", error); // Log reconnection errors
  });
  
  socketInstance.on("reconnect_failed", () => {
    console.error("Socket.IO reconnection failed after maximum attempts"); // Log reconnection failure
  });
}

// Function to disconnect socket
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect(); // Disconnect from server
    socket = null; // Clear socket instance
    console.log("Socket.IO client disconnected"); // Log disconnection
  }
}

// Function to emit custom events to server
export function emitEvent(eventName, data) {
  const socketInstance = getSocket(); // Get socket instance
  
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(eventName, data); // Emit event to server
    console.log("Emitted event:", eventName, "with data:", data); // Log event emission
  } else {
    console.warn("Cannot emit event - socket not connected"); // Log warning if not connected
  }
}

// Function to listen for custom events from server
export function onEvent(eventName, callback) {
  const socketInstance = getSocket(); // Get socket instance
  
  if (socketInstance) {
    socketInstance.on(eventName, callback); // Add event listener
    console.log("Listening for event:", eventName); // Log event listener setup
  } else {
    console.warn("Cannot listen for event - socket not available"); // Log warning if socket unavailable
  }
}

// Function to remove event listener
export function offEvent(eventName, callback) {
  const socketInstance = getSocket(); // Get socket instance
  
  if (socketInstance) {
    socketInstance.off(eventName, callback); // Remove event listener
    console.log("Removed listener for event:", eventName); // Log event listener removal
  }
}

// Function to get socket connection status
export function isSocketConnected() {
  return socket && socket.connected; // Return true if socket exists and is connected
}

// Function to get socket instance (for advanced usage)
export function getSocketInstance() {
  return socket; // Return the socket instance directly
}

// Export default socket instance for convenience
export default getSocket(); 