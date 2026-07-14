require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[BharatVision API] Listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
  process.exit(1);
});

start();
