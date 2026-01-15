import express from 'express';
import cors from 'cors';
import appRoutes from './routes/index.js';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware to parse JSON and URL-encoded data with a size limit of 16kb
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

// Enable CORS for all routes
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(cookieParser());

app.use('/api/v1', appRoutes);

export default app;
