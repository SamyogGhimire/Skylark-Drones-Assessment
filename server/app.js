const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', chatRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Skylark Drones BI Agent API' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🛸 Skylark Drones BI Agent Server running on port ${PORT}`);
  console.log(`   API Endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`===================================================`);
});
