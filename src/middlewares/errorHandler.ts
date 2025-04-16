import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: 'Validation failed', details: err.message });
  } else if (err.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Duplicate entry detected' });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default errorHandler;