/**
 * socketServer.js
 * 
 * PURPOSE: Socket.IO server for real-time communication in RainAlert application
 * 
 * FUNCTIONALITY:
 * - Creates HTTP server with Socket.IO integration
 * - Handles real-time events for user management
 * - Provides HTTP endpoints for triggering socket events
 * - Manages client connections and disconnections
 * 
 * KEY FEATURES:
 * - Real-time bidirectional communication
 * - HTTP endpoints for external event triggers
 * - Connection management and logging
 * - Event broadcasting to all connected clients
 * - CORS support for cross-origin requests
 * 
 * SOCKET EVENTS:
 * - user_added: Broadcasted when a new user is added
 * - user_deleted: Broadcasted when a user is deleted
 * - sensor_update: Broadcasted when sensor data changes
 * - alert_triggered: Broadcasted when flood alert is triggered
 * 
 * HTTP ENDPOINTS:
 * - POST /emit/user-added: Trigger user_added event
 * - POST /emit/user-deleted: Trigger user_deleted event
 * - GET /status: Check server status
 * 
 * SERVER CONFIGURATION:
 * - Port: 4000
 * - CORS: Enabled for all origins
 * - Transport: WebSocket with polling fallback
 * 
 * DEPENDENCIES:
 * - Express.js for HTTP server
 * - Socket.IO for real-time communication
 * - CORS middleware for cross-origin support
 */

const express = require("express"); // Import Express.js framework
const http = require("http"); // Import Node.js HTTP module
const { Server } = require("socket.io"); // Import Socket.IO server
const cors = require("cors"); // Import CORS middleware

// Create Express application
const app = express(); // Initialize Express app

// Configure CORS for cross-origin requests
app.use(cors({
  origin: "*", // Allow all origins (development only)
  methods: ["GET", "POST"], // Allow GET and POST methods
  credentials: true // Allow credentials
}));

// Parse JSON request bodies
app.use(express.json()); // Enable JSON body parsing

// Create HTTP server using Express app
const server = http.createServer(app); // Create HTTP server instance

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for Socket.IO connections
    methods: ["GET", "POST"] // Allow GET and POST methods
  }
});

// Store connected clients for management
const connectedClients = new Set(); // Set to track connected clients

// Socket.IO connection event handler
io.on("connection", (socket) => {
  // Add client to connected clients set
  connectedClients.add(socket.id); // Track new connection
  
  // Log new client connection
  console.log(`Client connected: ${socket.id}`);
  console.log(`Total connected clients: ${connectedClients.size}`);
  
  // Handle client disconnection
  socket.on("disconnect", () => {
    // Remove client from connected clients set
    connectedClients.delete(socket.id); // Remove from tracking
    
    // Log client disconnection
    console.log(`Client disconnected: ${socket.id}`);
    console.log(`Total connected clients: ${connectedClients.size}`);
  });
  
  // Handle custom events from clients
  socket.on("custom_event", (data) => {
    // Log received custom event
    console.log("Received custom event:", data);
    
    // Broadcast event to all connected clients
    io.emit("custom_event_response", {
      message: "Event received and broadcasted",
      data: data,
      timestamp: new Date().toISOString()
    });
  });
});

// HTTP endpoint to emit user_added event
app.post("/emit/user-added", (req, res) => {
  try {
    // Extract user data from request body
    const { user } = req.body; // Get user data from request
    
    // Validate user data
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User data is required"
      });
    }
    
    // Emit user_added event to all connected clients
    io.emit("user_added", {
      user: user,
      timestamp: new Date().toISOString(),
      message: "New user added to the system"
    });
    
    // Log event emission
    console.log("Emitted user_added event:", user);
    
    // Return success response
    res.json({
      success: true,
      message: "user_added event emitted successfully",
      connectedClients: connectedClients.size
    });
    
  } catch (error) { // If any error occurred
    // Log error
    console.error("Error emitting user_added event:", error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: "Failed to emit user_added event",
      error: error.message
    });
  }
});

// HTTP endpoint to emit user_deleted event
app.post("/emit/user-deleted", (req, res) => {
  try {
    // Extract user data from request body
    const { user } = req.body; // Get user data from request
    
    // Validate user data
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User data is required"
      });
    }
    
    // Emit user_deleted event to all connected clients
    io.emit("user_deleted", {
      user: user,
      timestamp: new Date().toISOString(),
      message: "User deleted from the system"
    });
    
    // Log event emission
    console.log("Emitted user_deleted event:", user);
    
    // Return success response
    res.json({
      success: true,
      message: "user_deleted event emitted successfully",
      connectedClients: connectedClients.size
    });
    
  } catch (error) { // If any error occurred
    // Log error
    console.error("Error emitting user_deleted event:", error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: "Failed to emit user_deleted event",
      error: error.message
    });
  }
});

// HTTP endpoint to check server status
app.get("/status", (req, res) => {
  // Return server status information
  res.json({
    success: true,
    message: "Socket.IO server is running",
    timestamp: new Date().toISOString(),
    connectedClients: connectedClients.size,
    serverInfo: {
      port: process.env.PORT || 4000,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
});

// HTTP endpoint to emit sensor_update event
app.post("/emit/sensor-update", (req, res) => {
  try {
    // Extract sensor data from request body
    const { sensorData } = req.body; // Get sensor data from request
    
    // Validate sensor data
    if (!sensorData) {
      return res.status(400).json({
        success: false,
        message: "Sensor data is required"
      });
    }
    
    // Emit sensor_update event to all connected clients
    io.emit("sensor_update", {
      sensorData: sensorData,
      timestamp: new Date().toISOString(),
      message: "Sensor data updated"
    });
    
    // Log event emission
    console.log("Emitted sensor_update event:", sensorData);
    
    // Return success response
    res.json({
      success: true,
      message: "sensor_update event emitted successfully",
      connectedClients: connectedClients.size
    });
    
  } catch (error) { // If any error occurred
    // Log error
    console.error("Error emitting sensor_update event:", error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: "Failed to emit sensor_update event",
      error: error.message
    });
  }
});

// HTTP endpoint to emit alert_triggered event
app.post("/emit/alert-triggered", (req, res) => {
  try {
    // Extract alert data from request body
    const { alertData } = req.body; // Get alert data from request
    
    // Validate alert data
    if (!alertData) {
      return res.status(400).json({
        success: false,
        message: "Alert data is required"
      });
    }
    
    // Emit alert_triggered event to all connected clients
    io.emit("alert_triggered", {
      alertData: alertData,
      timestamp: new Date().toISOString(),
      message: "Flood alert triggered"
    });
    
    // Log event emission
    console.log("Emitted alert_triggered event:", alertData);
    
    // Return success response
    res.json({
      success: true,
      message: "alert_triggered event emitted successfully",
      connectedClients: connectedClients.size
    });
    
  } catch (error) { // If any error occurred
    // Log error
    console.error("Error emitting alert_triggered event:", error);
    
    // Return error response
    res.status(500).json({
      success: false,
      message: "Failed to emit alert_triggered event",
      error: error.message
    });
  }
});

// Start server on specified port
const PORT = process.env.PORT || 4000; // Get port from environment or use default
server.listen(PORT, () => {
  // Log server startup
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Status endpoint: http://localhost:${PORT}/status`);
});

// Handle server shutdown gracefully
process.on("SIGINT", () => {
  console.log("Shutting down Socket.IO server..."); // Log shutdown message
  
  // Close all socket connections
  io.close(() => {
    console.log("All socket connections closed"); // Log connection closure
    
    // Exit process
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error); // Log uncaught exception
  
  // Close server gracefully
  server.close(() => {
    console.log("Server closed due to uncaught exception"); // Log server closure
    
    // Exit process
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason); // Log unhandled rejection
  
  // Close server gracefully
  server.close(() => {
    console.log("Server closed due to unhandled rejection"); // Log server closure
    
    // Exit process
    process.exit(1);
  });
}); 