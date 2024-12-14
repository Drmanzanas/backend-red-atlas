import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Middleware para manejar funciones asíncronas en rutas de Express.
 * Envuelve una función asíncrona y captura cualquier error para pasarlo al manejador de errores global.
 * 
 * @param fn Función manejadora asíncrona de rutas.
 * @returns Función manejadora de rutas envuelta.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};