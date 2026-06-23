const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "2-Tier Application Backend is running!",
    tier: "backend",
    timestamp: new Date().toISOString(),
  });
});

// Main API endpoint
app.get("/api/data", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to the 2-Tier K8s Application",
    description:
      "This is a full-stack application deployed on Kubernetes with Frontend and Backend tiers.",
    features: [
      "Modern UI with responsive design",
      "RESTful API communication",
      "Docker containerization",
      "Kubernetes orchestration",
      "Health monitoring",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 2-Tier Backend Server running on port ${PORT}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - GET /api/health`);
  console.log(`   - GET /api/data`);
});
