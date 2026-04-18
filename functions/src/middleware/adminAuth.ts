import { Request, Response, NextFunction } from 'express';
import { verifyGoogleIdToken } from '../auth/googleToken';
import { prisma } from '../prisma';

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

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const g = await verifyGoogleIdToken(token);

    const userRow = await prisma.user.findFirst({
      where: {
        OR: [{ id: g.sub }, ...(g.email ? [{ email: g.email }] : [])],
      },
    });

    if (!userRow) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!userRow.role || (userRow.role !== 'admin' && userRow.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Insufficient permissions. Admin access required.' });
    }

    req.user = {
      uid: userRow.id,
      email: userRow.email,
      role: userRow.role,
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);

    if (error instanceof Error) {
      if (error.message.includes('GOOGLE_CLIENT_ID') || error.message.includes('Token')) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const authenticateSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  authenticateAdmin(req, res, () => {
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
  });
};

export const checkPermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (req.user.role === 'super_admin') {
        return next();
      }

      if (req.user.role === 'admin') {
        return next();
      }

      const userRow = await prisma.user.findUnique({ where: { id: req.user.uid } });
      const perms = userRow?.permissions as { resource: string; actions: string[] }[] | null;

      if (!perms || !Array.isArray(perms)) {
        return res.status(403).json({ error: 'No permissions configured for user' });
      }

      const hasPermission = perms.some(
        (permission) => permission.resource === resource && permission.actions.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: `Permission denied. Required: ${action} on ${resource}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    const originalJson = res.json;
    res.json = function json(data: unknown) {
      return originalJson.call(this, data);
    };

    res.on('finish', async () => {
      try {
        const endTime = Date.now();
        const duration = endTime - startTime;

        await prisma.adminAuditLog.create({
          data: {
            action,
            resource,
            user_id: req.user?.uid,
            details: {
              method: req.method,
              path: req.path,
              query: req.query || {},
              statusCode: res.statusCode,
              duration,
              ip: req.ip || '',
              userAgent: req.get('User-Agent') || '',
            },
          },
        });
      } catch (error) {
        console.error('Audit logging error:', error);
      }
    });

    next();
  };
};
