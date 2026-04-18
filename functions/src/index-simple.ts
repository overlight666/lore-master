import { onRequest } from "firebase-functions/v2/https";
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Lore Master API'
  });
});

export const api = onRequest(app);
