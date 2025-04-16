import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import inventoryRoutes from './routes/inventory.routes';
import supplierRoutes from './routes/suppliers.routes';
import errorHandler from './middlewares/errorHandler';

const app: Application = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});