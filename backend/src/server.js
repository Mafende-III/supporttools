/**
 * Main Express Server
 * Microservices Flow Designer Backend API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { testConnection, close } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/flows', require('./routes/flows'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Microservices Flow Designer API',
    version: '1.0.0',
    docs: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      flows: '/api/flows'
    }
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================================================
// SERVER START
// ============================================================================

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start listening
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║   Microservices Flow Designer Backend API                  ║');
      console.log('╠════════════════════════════════════════════════════════════╣');
      console.log(`║   🚀 Server running on port ${PORT}                       ║`);
      console.log(`║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║`);
      console.log(`║   📊 Health check: http://localhost:${PORT}/health         ║`);
      console.log(`║   📡 API base: http://localhost:${PORT}/api                ║`);
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('✅ HTTP server closed');

        await close();
        console.log('✅ Database connections closed');

        console.log('👋 Goodbye!');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
