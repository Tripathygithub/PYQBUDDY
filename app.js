

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var colors = require('colors');
var helmet = require('helmet');
var compression = require('compression');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { generalLimiter } = require('./service/rateLimiter');

var app = express();

console.log("Mongo URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB is Connected".cyan.underline))
  .catch((error) => console.log(`Error: ${error.message}`.red.underline.bold));

// ==================== SECURITY MIDDLEWARE ====================
// Helmet - Set security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development, enable in production
  crossOriginEmbedderPolicy: false
}));

// Compression - Compress response bodies
app.use(compression());

// CORS - Configure allowed origins
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*' 
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - Apply to all requests
app.use(generalLimiter);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');  // Use 'pug' instead of 'jade' if you're using newer versions

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "./buildd")));

// API Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404 handler - API endpoint not found
app.use(function (req, res, next) {
  // Check if it's an API request
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.originalUrl
    });
  }
  
  // For non-API requests, serve the frontend
  res.sendFile(path.join(__dirname, "./buildd", "index.html"));
});

// Global error handler - return JSON errors for API
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message: message,
    error: req.app.get('env') === 'development' ? {
      stack: err.stack,
      details: err
    } : undefined
  });
});

const port = process.env.PORT || 2556;  // Ensure you use an environment variable or fallback to 2556
console.log(`Attempting to start server on port: ${port}`.yellow);

// Catch any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:'.red, error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:'.red, promise, 'reason:', reason);
});

const server = app.listen(port, '0.0.0.0', () => {  // Ensure server binds to all IPs
  console.log(`✓ Server successfully started and listening on http://localhost:${port}`.green.underline);
  console.log(`✓ Server is ready to accept connections`.green);
});

server.on('error', (error) => {
  console.error(`✗ Server error:`.red.bold, error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`.red);
  }
  process.exit(1);
});

// Keep the process running
setInterval(() => {
  // This keeps the process alive
}, 1000 * 60 * 60); // Check every hour

// module.exports = app;  // Commented out to prevent any issues
