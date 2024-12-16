import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'defaultsecret';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        console.log(req)

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            if (typeof decoded === 'object' && 'role' in decoded) {
                req.user = decoded as JwtPayload & { role: string };
                next();
            } else {
                res.status(403).json({ message: 'Invalid token structure.' });
            }
        });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};



export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
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

            if (!roles.includes((user as any).role)) {
                res.status(403).json({ message: 'Forbidden: You do not have access to this resource.' });
                return;
            }

            next();
        } catch (error) {
            console.error('Error in authorizeRoles middleware:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    };
};