import express, { Request, Response, NextFunction } from 'express';
import { router } from './routes/api.js';
import { apiRouter } from './routes/index.js';

const app = express();

app.use('/', apiRouter);
app.use(router);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Villa!!', err);
 //  res.status(500).json({ error: 'Villa kom upp' });
}

app.use(errorHandler);

const port = 3000;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
