import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "defaultsecret";

/**
 * Genera un token JWT para un usuario.
 * @param payload - Información del usuario (debe incluir `id` y `role`).
 * @param expiresIn - Tiempo de expiración del token (por defecto: '1h').
 * @returns Token JWT firmado.
 */
export const generateToken = (payload: { id: string; role: string }, expiresIn: string = '1h') => {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
};