import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import inventoryRoutes from './routes/inventory.routes';
import suppliersRoutes from './routes/suppliers.routes';
import errorHandler from '../src/middlewares/errorHandler';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', suppliersRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
app.use(errorHandler);
export default app;