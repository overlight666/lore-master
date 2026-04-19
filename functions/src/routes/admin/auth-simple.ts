import { Router } from 'express';
import { verifyGoogleIdToken } from '../../auth/googleToken';
import { resolveAdminPanelUser } from '../../auth/adminAllowlist';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'Google ID token is required',
      });
    }

    const g = await verifyGoogleIdToken(idToken);

    const userRow = await resolveAdminPanelUser(g);

    if (!userRow) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({
      success: true,
      token: idToken,
      user: {
        uid: userRow.id,
        email: userRow.email,
        username: userRow.username,
        role: userRow.role,
        isActive: userRow.is_active,
        profileData: {
          firstName: userRow.username,
          lastName: '',
          avatar: g.picture || null,
        },
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

router.post('/logout', async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const g = await verifyGoogleIdToken(idToken);

    const userRow = await resolveAdminPanelUser(g);

    if (!userRow) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({
      user: {
        uid: userRow.id,
        email: userRow.email,
        username: userRow.username,
        role: userRow.role,
        isActive: userRow.is_active,
        profileData: {
          firstName: userRow.username,
          lastName: '',
          avatar: g.picture || null,
        },
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const g = await verifyGoogleIdToken(idToken);

    const userRow = await resolveAdminPanelUser(g);

    if (!userRow) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json({
      token: idToken,
      user: {
        uid: userRow.id,
        email: userRow.email,
        username: userRow.username,
        role: userRow.role,
        isActive: userRow.is_active,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
