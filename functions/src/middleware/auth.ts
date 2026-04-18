import { Request, Response, NextFunction } from 'express';
import { verifyGoogleIdToken } from '../auth/googleToken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        uid?: string;
        email?: string;
        username?: string;
        role?: string;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const g = await verifyGoogleIdToken(token);
    req.user = {
      id: g.sub,
      uid: g.sub,
      email: g.email,
      username: g.name || g.email?.split('@')[0] || '',
    };
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
