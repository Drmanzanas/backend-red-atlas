// api/index.ts

import 'reflect-metadata';
import { AppDataSource } from '../src/database/data-source';
import app from '../src/app';

// Initialize the database connection once
let initialized = false;

const initializeDatabase = async () => {
  if (!initialized) {
    await AppDataSource.initialize();
    console.log('Database connected!');
    initialized = true;
  }
};

// Export the serverless function handler
export default async (req, res) => {
  await initializeDatabase();

  // Wrap Express app to handle the request
  app(req, res);
};