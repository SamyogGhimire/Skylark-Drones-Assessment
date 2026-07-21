const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Load environment variables
try {
  require("dotenv").config();
  console.log('[Startup] Environment variables loaded');
} catch (err) {
  console.warn('[Startup] Warning: Failed to load .env file:', err.message);
}

let chatRouter;
try {
  chatRouter = require("./routes/chat");
  console.log('[Startup] Chat router loaded');
} catch (err) {
  console.error('[Startup] CRITICAL: Failed to load chat router:', err.message);
  throw err;
}

const app = express();

// Startup validation
const hasEnvConfig = process.env.MONDAY_API_KEY && process.env.DEALS_BOARD_ID && process.env.WORK_ORDERS_BOARD_ID;
const csvPath = path.join(__dirname, 'data');
const hasCSVData = fs.existsSync(csvPath) && 
  fs.existsSync(path.join(csvPath, 'deals.csv')) &&
  fs.existsSync(path.join(csvPath, 'work_orders.csv'));

console.log(`[Startup] Monday.com API configured: ${hasEnvConfig}`);
console.log(`[Startup] CSV data available: ${hasCSVData}`);

if (!hasEnvConfig && !hasCSVData) {
  console.warn('[Startup] WARNING: Neither Monday.com API nor CSV data is available. The service will have limited functionality.');
}

app.use(cors({
  origin: 'https://skylark-drones-assessment.vercel.app',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

app.use("/api", chatRouter);

app.get("/", (req, res) => {
    res.json({
        status: "running",
        service: "Skylark BI Agent",
        dataSource: hasEnvConfig ? "monday.com" : "csv",
        hasEnvConfig,
        hasCSVData,
        timestamp: new Date().toISOString()
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        env: {
          hasMonday: !!process.env.MONDAY_API_KEY,
          hasDealsBoard: !!process.env.DEALS_BOARD_ID,
          hasWorkOrdersBoard: !!process.env.WORK_ORDERS_BOARD_ID,
          hasGroq: !!process.env.GROQ_API_KEY,
        },
        csvData: {
          hasData: hasCSVData
        }
    });
});

app.get("/debug", (req, res) => {
    res.json({
        environment: {
          hasMonday: !!process.env.MONDAY_API_KEY,
          hasDealsBoard: !!process.env.DEALS_BOARD_ID,
          hasWorkOrdersBoard: !!process.env.WORK_ORDERS_BOARD_ID,
          hasGroq: !!process.env.GROQ_API_KEY,
          csvData: hasCSVData,
          nodeEnv: process.env.NODE_ENV,
        },
        paths: {
          cwd: process.cwd(),
          dirname: __dirname,
          csvPath: csvPath,
        }
    });
});

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

console.log('[Startup] Express app configured successfully');

module.exports = app;