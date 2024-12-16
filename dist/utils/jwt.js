"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || "defaultsecret";
/**
 * Genera un token JWT para un usuario.
 * @param payload - Información del usuario (debe incluir `id` y `role`).
 * @param expiresIn - Tiempo de expiración del token (por defecto: '1h').
 * @returns Token JWT firmado.
 */
const generateToken = (payload, expiresIn = '1h') => {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn });
};
exports.generateToken = generateToken;
