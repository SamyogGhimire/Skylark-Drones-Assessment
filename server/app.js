const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const chatRouter = require("../routes/chat");

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

app.use(cors());
app.use(express.json());

app.use("/api", chatRouter);

app.get("/", (req, res) => {
    res.json({
        status: "running",
        service: "Skylark BI Agent",
        dataSource: hasEnvConfig ? "monday.com" : "csv",
        hasEnvConfig,
        hasCSVData
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
});

module.exports = app;