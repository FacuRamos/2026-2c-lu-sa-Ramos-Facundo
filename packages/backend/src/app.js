import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    // Health check
    app.get('/', (req, res) => {
        res.json({
            status: 'online',
            service: 'AI Ticket It API',
            version: '1.0.0'
        });
    });

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Routes
    app.use('/api', apiRouter);

    // 404 Route Not Found
    app.use((req, res) => {
        res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
    });

    // Centralized Error Handler
    app.use(errorHandler);

    return app;
}

export const app = createApp();
