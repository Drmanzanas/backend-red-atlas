import * as express from 'express';
import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
    export interface Request {
        user?: JwtPayload & { role: string };
    }
    export interface Response {
        user?: JwtPayload & { role: string };
    }
  }
}