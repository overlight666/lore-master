import type { User } from '@prisma/client';
import { prisma } from '../prisma';
import { GAME_CONSTANTS } from '../config/constants';
import type { GoogleUserPayload } from './googleToken';
import { parseEmailAllowlist } from './googleToken';

/**
 * Comma-separated emails allowed to use the admin panel when the DB is empty or users lack roles.
 * First successful Google sign-in creates a User row with role `admin` (unless super-admin list applies).
 */
export function getAdminPanelAllowlist(): Set<string> {
  return parseEmailAllowlist(process.env.ADMIN_PANEL_ALLOWLIST_EMAILS);
}

/** Optional; emails here receive `super_admin` when created or promoted. */
export function getSuperAdminPanelAllowlist(): Set<string> {
  return parseEmailAllowlist(process.env.ADMIN_PANEL_SUPER_ADMIN_EMAILS);
}

function normalizeEmail(email: string | undefined): string | null {
  const e = email?.trim().toLowerCase();
  return e || null;
}

/**
 * Finds or creates the user and ensures admin / super_admin access when the email is allowlisted.
 * Returns null if this Google user may not use the admin panel.
 */
export async function resolveAdminPanelUser(g: GoogleUserPayload): Promise<User | null> {
  const em = normalizeEmail(g.email);
  if (!em || !g.email) {
    return null;
  }

  const superSet = getSuperAdminPanelAllowlist();
  const adminSet = getAdminPanelAllowlist();
  const inSuper = superSet.has(em);
  const inAdmin = adminSet.has(em) || inSuper;

  let userRow = await prisma.user.findFirst({
    where: {
      OR: [{ id: g.sub }, { email: g.email }],
    },
  });

  if (!userRow && inAdmin) {
    const now = new Date();
    const role = inSuper ? 'super_admin' : 'admin';
    userRow = await prisma.user.create({
      data: {
        id: g.sub,
        email: g.email,
        username: g.name?.split(/\s+/)[0] || g.email.split('@')[0] || 'admin',
        password_hash: null,
        energy: GAME_CONSTANTS.MAX_ENERGY,
        energy_updated_at: now,
        created_at: now,
        updated_at: now,
        role,
        is_active: true,
        permissions: ['read', 'write', 'admin_access'],
      },
    });
  } else if (userRow) {
    if (inSuper && userRow.role !== 'super_admin') {
      userRow = await prisma.user.update({
        where: { id: userRow.id },
        data: { role: 'super_admin', updated_at: new Date() },
      });
    } else if (inAdmin && !inSuper) {
      if (userRow.role !== 'admin' && userRow.role !== 'super_admin') {
        userRow = await prisma.user.update({
          where: { id: userRow.id },
          data: { role: 'admin', updated_at: new Date() },
        });
      }
    }
  }

  if (!userRow) {
    return null;
  }

  if (!userRow.role || (userRow.role !== 'admin' && userRow.role !== 'super_admin')) {
    return null;
  }

  return userRow;
}
