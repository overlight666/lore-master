import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { GAME_CONSTANTS } from '../config/constants';
import { prisma } from '../prisma';
import { EnergyStatus, AdWatched } from '../models/types';

const router = Router();

router.get('/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const userRow = await prisma.user.findUnique({ where: { id: userId } });
    if (!userRow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    let lastUpdate: Date;
    try {
      lastUpdate = userRow.energy_updated_at instanceof Date
        ? userRow.energy_updated_at
        : new Date(userRow.energy_updated_at);
    } catch {
      lastUpdate = new Date();
    }

    const now = new Date();
    const hoursSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));

    let nextEnergyAt: Date | undefined;
    if (userRow.energy < GAME_CONSTANTS.MAX_ENERGY) {
      const hoursUntilNext =
        GAME_CONSTANTS.ENERGY_REGENERATION_HOURS - (hoursSinceUpdate % GAME_CONSTANTS.ENERGY_REGENERATION_HOURS);
      nextEnergyAt = new Date(now.getTime() + hoursUntilNext * 60 * 60 * 1000);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const adsRows = await prisma.adsWatched.findMany({
      where: { user_id: userId },
    });
    const adsWatchedToday = adsRows.filter((doc) => {
      const watchedAt = doc.watched_at instanceof Date ? doc.watched_at : new Date(doc.watched_at);
      return watchedAt >= todayStart;
    }).length;

    const energyStatus: EnergyStatus = {
      current_energy: userRow.energy,
      max_energy: GAME_CONSTANTS.MAX_ENERGY,
      next_energy_at: nextEnergyAt,
      ads_watched_today: adsWatchedToday,
      max_ads_per_day: GAME_CONSTANTS.MAX_ADS_PER_DAY,
    };

    res.status(200).json(energyStatus);
  } catch (error) {
    console.error('Error fetching energy status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/watch-ad', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const adsRows = await prisma.adsWatched.findMany({ where: { user_id: userId } });
    const adsWatchedToday = adsRows.filter((doc) => {
      const watchedAt = doc.watched_at instanceof Date ? doc.watched_at : new Date(doc.watched_at);
      return watchedAt >= todayStart;
    }).length;

    if (adsWatchedToday >= GAME_CONSTANTS.MAX_ADS_PER_DAY) {
      res.status(400).json({ error: 'Daily ad limit reached' });
      return;
    }

    const userRow = await prisma.user.findUnique({ where: { id: userId } });
    if (!userRow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (userRow.energy >= GAME_CONSTANTS.MAX_ENERGY + GAME_CONSTANTS.MAX_ADS_PER_DAY) {
      res.status(400).json({ error: 'Energy already at maximum' });
      return;
    }

    const now = new Date();
    const adWatched: AdWatched = {
      id: uuidv4(),
      user_id: userId,
      watched_at: now,
    };

    await prisma.$transaction([
      prisma.adsWatched.create({
        data: {
          id: adWatched.id,
          user_id: userId,
          watched_at: now,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          energy: userRow.energy + 1,
          energy_updated_at: now,
          updated_at: now,
        },
      }),
    ]);

    res.status(200).json({
      message: 'Energy added successfully',
      new_energy: userRow.energy + 1,
    });
  } catch (error) {
    console.error('Error watching ad:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
