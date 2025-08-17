/**
 * Server Entry Point
 * 
 * Starts the Express server with proper error handling,
 * graceful shutdown, and environment configuration.
 */

const app = require('./app');
const { logError } = require('./middleware/errorHandler');

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Server instance
let server;

/**
 * Start the server
 */
const startServer = () => {
  server = app.listen(PORT, () => {
    console.log('🚀 Wave Caption Generator Backend Server');
    console.log(`📡 Environment: ${NODE_ENV}`);
    console.log(`🔧 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/api/docs`);
    
    // Log configuration status
    if (process.env.PRINTIFY_API_TOKEN) {
      console.log('🔑 Printify API Token: ✅ Configured');
    } else {
      console.log('🔑 Printify API Token: ❌ Missing (set PRINTIFY_API_TOKEN)');
    }
    
    if (process.env.PRINTIFY_SHOP_ID) {
      console.log(`🏪 Printify Shop ID: ✅ ${process.env.PRINTIFY_SHOP_ID}`);
    } else {
      console.log('🏪 Printify Shop ID: ❌ Missing (set PRINTIFY_SHOP_ID)');
    }
    
    console.log('✅ Ready for API calls!');
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    switch (error.code) {
      case 'EACCES':
        console.error(`❌ ${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`❌ ${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = (signal) => {
  console.log(`\n📤 Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close((err) => {
      if (err) {
        logError(err);
        process.exit(1);
      }
      
      console.log('🛑 HTTP server closed.');
      console.log('✅ Graceful shutdown completed.');
      process.exit(0);
    });
    
    // Force close server after 30 seconds
    setTimeout(() => {
      console.error('⚠️ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  logError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  logError(new Error(`Unhandled Rejection: ${reason}`));
  process.exit(1);
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, gracefulShutdown };