import 'reflect-metadata';
import { AppDataSource } from './database/data-source';
import app from './app';

const PORT = process.env.PORT || 3000;

AppDataSource.initialize().then(() => {
  console.log('Database connected!');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Error during Data Source initialization', error);
});