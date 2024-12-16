import 'reflect-metadata';
import { AppDataSource } from './database/data-source';
import app from './app';

let isDbConnected = false;

const initializeDb = async () => {
  if (!isDbConnected) {
    try {
      await AppDataSource.initialize();
      console.log('Database connected!');
      isDbConnected = true;
    } catch (error) {
      console.error('Error during Data Source initialization', error);
    }
  }
};

app.use(async (req, res, next) => {
  await initializeDb();
  next();
});

export default app;