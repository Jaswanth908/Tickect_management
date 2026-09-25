const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test MySQL Connection on boot
  await testConnection();

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Support Ticket Backend API Server`);
    console.log(`📡 Running on: http://localhost:${PORT}`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
};

startServer();
