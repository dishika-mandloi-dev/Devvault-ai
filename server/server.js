const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const snippetRoutes = require('./routes/snippetRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const snippetStorage = require('./services/snippetStorage');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devvault';

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health / Status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    app: 'DevVault AI Backend',
    database: snippetStorage.getMongoConnected() ? 'MongoDB (Connected)' : 'Resilient In-Memory Mode',
    groqConfigured: Boolean(process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq_api_key')),
    timestamp: new Date().toISOString(),
  });
});

// REST API Routes
app.use('/api/snippets', snippetRoutes);
app.use('/api/analyze', analyzeRoutes);

// 404 Handler for undefined API routes (Express 5 compatible)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Connect to MongoDB with graceful fallback
async function startServer() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting DevVault AI Server...');
  console.log('----------------------------------------------------');

  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':$1***@')} (timeout: 5s)...`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    snippetStorage.setMongoConnected(true);
    console.log(' Connected to MongoDB successfully.');
    await snippetStorage.seedMongoIfEmpty();
  } catch (mongoErr) {
    snippetStorage.setMongoConnected(false);
    console.warn('⚠️  Could not connect to MongoDB server:', mongoErr.message);
    console.log('✨ Activated Resilient In-Memory Storage Mode for DevVault AI.');
    console.log('📦 Pre-populated with 3 realistic developer seed entries.');
    console.log('   (To connect to MongoDB Atlas, add MONGODB_URI in server/.env)');
  }

  app.listen(PORT, () => {
    console.log(` DevVault AI Backend is running on: http://localhost:${PORT}`);
    console.log(` REST API: http://localhost:${PORT}/api/snippets`);
    console.log(` AI Route: http://localhost:${PORT}/api/analyze`);
    console.log('----------------------------------------------------');
  });
}

startServer();

module.exports = app;
