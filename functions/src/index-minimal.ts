import { onRequest } from "firebase-functions/v2/https";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Lore Master API'
  });
});

// Simple auth endpoints
app.post('/auth/signup', (req, res) => {
  res.status(200).json({ message: 'Signup endpoint working' });
});

app.post('/auth/login', (req, res) => {
  res.status(200).json({ message: 'Login endpoint working' });
});

// Simple game endpoints
app.get('/game/topics', (req, res) => {
  res.status(200).json({ topics: [] });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export the Express app as a Firebase Function
export const api = onRequest(app);
