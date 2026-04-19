import { Router } from 'express';
import { verifyGoogleIdToken } from '../../auth/googleToken';
import { resolveAdminPanelUser } from '../../auth/adminAllowlist';
import { prisma } from '../../prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    const g = await verifyGoogleIdToken(idToken);

    const userRow = await resolveAdminPanelUser(g);

    if (!userRow) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await prisma.user.update({
      where: { id: userRow.id },
      data: { updated_at: new Date() },
    });

    res.json({
      token: idToken,
      user: {
        id: userRow.id,
        email: userRow.email,
        username: userRow.username,
        role: userRow.role,
        permissions: (userRow.permissions as unknown[]) || [],
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userRow = await prisma.user.findUnique({ where: { id: req.user.uid } });

    if (!userRow) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: req.user.uid,
        uid: req.user.uid,
        email: req.user.email,
        username: userRow.username,
        role: userRow.role,
        permissions: (userRow.permissions as unknown[]) || [],
        createdAt: userRow.created_at,
        lastLogin: userRow.updated_at,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/refresh', authenticateAdmin, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    res.json({
      message: 'Token is still valid',
      user: {
        id: req.user.uid,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/logout', authenticateAdmin, async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Promotes an existing user (who has already signed in with Google at least once) to admin.
 */
router.post('/create-admin', authenticateAdmin, async (req, res) => {
  try {
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const { email, username, role, permissions } = req.body;

    if (!email || !username || !role) {
      return res.status(400).json({ error: 'Email, username, and role are required' });
    }

    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or super_admin' });
    }

    const target = await prisma.user.findFirst({ where: { email } });

    if (!target) {
      return res.status(404).json({
        error:
          'No user with this email. They must sign in with Google once so a user row exists, then you can promote them.',
      });
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        username,
        role,
        permissions: permissions ?? [],
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      message: 'Admin role updated successfully',
      user: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        role: updated.role,
        permissions: permissions || [],
      },
    });
  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({
      error: 'Failed to update admin user',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
