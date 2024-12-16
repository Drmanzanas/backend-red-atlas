"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log(req);
        jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }
            if (typeof decoded === 'object' && 'role' in decoded) {
                req.user = decoded;
                next();
            }
            else {
                res.status(403).json({ message: 'Invalid token structure.' });
            }
        });
    }
    else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
exports.authenticateJWT = authenticateJWT;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                res.status(403).json({ message: 'Forbidden: No user found in request.' });
                return;
            }
            if (typeof user !== 'object' || !('role' in user)) {
                res.status(403).json({ message: 'Forbidden: Invalid user object.' });
                return;
            }
            if (!roles.includes(user.role)) {
                res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
                return;
            }
            next();
        }
        catch (error) {
            console.error('Error in authorizeRoles middleware:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };
};
exports.authorizeRoles = authorizeRoles;
