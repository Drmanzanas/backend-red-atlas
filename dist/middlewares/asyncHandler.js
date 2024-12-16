"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * Middleware para manejar funciones asíncronas en rutas de Express.
 * Envuelve una función asíncrona y captura cualquier error para pasarlo al manejador de errores global.
 *
 * @param fn Función manejadora asíncrona de rutas.
 * @returns Función manejadora de rutas envuelta.
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
