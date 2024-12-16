import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes/index';

const app: Application = express();

app.use(helmet());

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

app.use(cors());

app.use('/api', routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;