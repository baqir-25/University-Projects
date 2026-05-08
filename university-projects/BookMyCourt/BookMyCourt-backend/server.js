const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan')
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json());

// --- Route Wiring (Plugging in our refactored OOP routes) ---
app.use(morgan('dev'));

// Auth Routes (Register/Login)
app.use('/api/auth', require('./routes/authRoutes'));

// Arena Routes (Searching/Details)
app.use('/api/arenas', require('./routes/arenaRoutes'));

// Booking Routes (Creating/History)
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.use("/api/deals", require("./routes/dealRoutes"));

app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/owner", require("./routes/ownerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Global Error Handler (Optional but recommended for SOLID)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(`Server running in ${env} mode on port ${PORT}`);
});