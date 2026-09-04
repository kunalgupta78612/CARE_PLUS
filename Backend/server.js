import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import patientRoutes from './routes/patientRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load Environment Variables
dotenv.config();

// Connect MongoDB Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Healthy',
    service: 'CarePlus HMS Backend Authentication API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/patient', patientRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 CarePlus HMS Backend Server running on http://localhost:${PORT}`);
  console.log(`🔒 Patient Auth Endpoint: http://localhost:${PORT}/api/patient`);
});
