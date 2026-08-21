import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';

import { environment } from './config/environment.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.routes.js';
import { adminResourceRouter } from './routes/admin-resource.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { equipmentRouter } from './routes/equipment.routes.js';
import { reservationRouter } from './routes/reservation.routes.js';
import { waitlistRouter } from './routes/waitlist.routes.js';
import { trainingRouter } from './routes/training.routes.js';
import { checkInRouter } from './routes/check-in.routes.js';

export const app = express();

app.use(cors({ origin: environment.frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    message: 'Backend is running',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminResourceRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/equipment', equipmentRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/waitlist', waitlistRouter);
app.use('/api/training', trainingRouter);
app.use('/api/check-in', checkInRouter);

app.use((_request, response) => {
  response.status(404).json({ error: { message: 'Route not found.' } });
});

app.use(errorHandler);
