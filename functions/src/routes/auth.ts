import { Router, Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { GAME_CONSTANTS } from '../config/constants';
import { verifyGoogleIdToken, parseEmailAllowlist } from '../auth/googleToken';
import { prisma } from '../prisma';
import { CreateUserRequest, LoginRequest, AuthResponse, User } from '../models/types';

const router = Router();

router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username }: CreateUserRequest = req.body;

    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password, and username are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          id: userId,
          email,
          password_hash,
          username,
          energy: GAME_CONSTANTS.MAX_ENERGY,
          energy_updated_at: now,
          created_at: now,
          updated_at: now,
          is_active: true,
        },
      });
      await tx.userLifeline.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          type: 'fiftyFifty',
          quantity: 0,
          updated_at: now,
        },
      });
      await tx.userLifeline.create({
        data: {
          id: uuidv4(),
          user_id: userId,
          type: 'callFriend',
          quantity: 0,
          updated_at: now,
        },
      });
    });

    const token = null;

    const userResponse = {
      id: userId,
      email,
      username,
      energy: GAME_CONSTANTS.MAX_ENERGY,
      energy_updated_at: now,
      created_at: now,
      updated_at: now,
    };

    const response: AuthResponse = {
      token,
      user: userResponse as any,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const userRow = await prisma.user.findFirst({ where: { email } });

    if (!userRow || !userRow.password_hash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, userRow.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const userData: User = {
      id: userRow.id,
      email: userRow.email,
      password_hash: userRow.password_hash,
      username: userRow.username,
      energy: userRow.energy,
      energy_updated_at: userRow.energy_updated_at,
      created_at: userRow.created_at,
      updated_at: userRow.updated_at,
    };

    const updatedUser = await updateUserEnergy(userData);

    const token = null;

    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      energy: updatedUser.energy,
      energy_updated_at: updatedUser.energy_updated_at,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    };

    const response: AuthResponse = {
      token,
      user: userResponse as any,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function updateUserEnergy(user: User): Promise<User> {
  const now = new Date();
  const lastUpdate = new Date(user.energy_updated_at);
  const hoursPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));

  if (hoursPassed >= GAME_CONSTANTS.ENERGY_REGENERATION_HOURS) {
    const energyToAdd = Math.floor(hoursPassed / GAME_CONSTANTS.ENERGY_REGENERATION_HOURS);
    const newEnergy = Math.min(user.energy + energyToAdd, GAME_CONSTANTS.MAX_ENERGY);

    if (newEnergy !== user.energy) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          energy: newEnergy,
          energy_updated_at: now,
          updated_at: now,
        },
      });

      return {
        ...user,
        energy: newEnergy,
        energy_updated_at: now,
        updated_at: now,
      };
    }
  }

  return user;
}

router.post('/init-user', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const g = await verifyGoogleIdToken(token);
    const userId = g.sub;
    const email = g.email || '';
    const username = g.name || email?.split('@')[0] || 'User';

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) {
      res.status(200).json({ message: 'User already exists', user: existing });
      return;
    }

    const superEmails = parseEmailAllowlist(process.env.SUPER_ADMIN_EMAILS);
    const adminEmails = parseEmailAllowlist(process.env.ADMIN_EMAILS);
    const em = email.toLowerCase();
    let role: string | undefined;
    if (em && superEmails.has(em)) {
      role = 'super_admin';
    } else if (em && adminEmails.has(em)) {
      role = 'admin';
    }

    const now = new Date();
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        password_hash: null,
        username,
        energy: GAME_CONSTANTS.MAX_ENERGY,
        energy_updated_at: now,
        created_at: now,
        updated_at: now,
        is_active: true,
        role,
      },
    });

    res.status(201).json({
      message: 'User initialized successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
