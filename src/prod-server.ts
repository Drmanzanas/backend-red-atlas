import 'reflect-metadata';
import { AppDataSource } from './database/data-source';
import app from './app';


AppDataSource.initialize()
  .then(() => {
    console.log('Database connected!');
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  });

export default app;