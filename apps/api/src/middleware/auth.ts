import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiErrors } from '../utils/response';

export interface AuthRequest extends Request {
  userId: string;
  userEmail: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    ApiErrors.unauthorized(res);
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    ApiErrors.unauthorized(res, 'Invalid or expired token');
  }
}
