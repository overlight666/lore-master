import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../prisma';
import { LifelinesInventory, Purchase } from '../models/types';

const router = Router();

router.get('/lifelines/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user!.id;

    if (userId !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const rows = await prisma.userLifeline.findMany({ where: { user_id: userId } });

    const inventory: LifelinesInventory = {
      fiftyFifty: 0,
      callFriend: 0,
    };

    for (const row of rows) {
      if (row.type === 'fiftyFifty') {
        inventory.fiftyFifty = row.quantity;
      } else if (row.type === 'callFriend') {
        inventory.callFriend = row.quantity;
      }
    }

    res.status(200).json(inventory);
  } catch (error) {
    console.error('Error fetching lifelines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/purchase', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { item_type, quantity, price } = req.body;

    if (!item_type || !quantity || !price) {
      res.status(400).json({ error: 'Item type, quantity, and price are required' });
      return;
    }

    if (!['energy', 'fiftyFifty', 'callFriend'].includes(item_type)) {
      res.status(400).json({ error: 'Invalid item type' });
      return;
    }

    if (quantity <= 0 || price <= 0) {
      res.status(400).json({ error: 'Quantity and price must be positive' });
      return;
    }

    const now = new Date();
    const purchaseId = uuidv4();

    const purchase: Purchase = {
      id: purchaseId,
      user_id: userId,
      item_type,
      quantity,
      purchased_at: now,
      price,
    };

    await prisma.$transaction(async (tx) => {
      await tx.purchase.create({
        data: {
          id: purchaseId,
          user_id: userId,
          item_type,
          quantity,
          price,
          purchased_at: now,
        },
      });

      if (item_type === 'energy') {
        const userRow = await tx.user.findUnique({ where: { id: userId } });
        if (!userRow) {
          throw new Error('User not found');
        }
        await tx.user.update({
          where: { id: userId },
          data: {
            energy: userRow.energy + quantity,
            updated_at: now,
          },
        });
      } else {
        const existing = await tx.userLifeline.findFirst({
          where: {
            user_id: userId,
            type: item_type,
          },
        });

        if (existing) {
          await tx.userLifeline.update({
            where: { id: existing.id },
            data: {
              quantity: existing.quantity + quantity,
              updated_at: now,
            },
          });
        } else {
          await tx.userLifeline.create({
            data: {
              id: uuidv4(),
              user_id: userId,
              type: item_type,
              quantity,
              updated_at: now,
            },
          });
        }
      }
    });

    res.status(200).json({
      message: 'Purchase successful',
      purchase_id: purchaseId,
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/purchases/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user!.id;

    if (userId !== requestingUserId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const rows = await prisma.purchase.findMany({
      where: { user_id: userId },
      orderBy: { purchased_at: 'desc' },
    });

    const purchases: Purchase[] = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      item_type: r.item_type as Purchase['item_type'],
      quantity: r.quantity,
      purchased_at: r.purchased_at,
      price: r.price,
    }));

    res.status(200).json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
