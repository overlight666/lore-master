import { prisma } from '../prisma';

/**
 * Grants admin or super_admin in PostgreSQL by email.
 * The user must already have a row (e.g. after signing in with Google once via the app).
 */
export async function setupAdminUser(
  email: string,
  role: 'admin' | 'super_admin' = 'admin'
): Promise<boolean> {
  try {
    console.log(`Setting up admin user: ${email}`);

    const row = await prisma.user.findFirst({ where: { email } });

    if (!row) {
      console.log('No user row for this email. Sign in with Google in the app once, then run again.');
      return false;
    }

    await prisma.user.update({
      where: { id: row.id },
      data: {
        role,
        is_active: true,
        permissions: ['read', 'write', 'admin_access'],
        updated_at: new Date(),
      },
    });

    console.log('User role updated in PostgreSQL. id=', row.id);
    return true;
  } catch (error) {
    console.error('Error setting up admin user:', error);
    return false;
  }
}

export async function verifyAdminUser(email: string): Promise<boolean> {
  try {
    const row = await prisma.user.findFirst({ where: { email } });
    return row?.role === 'admin' || row?.role === 'super_admin';
  } catch (error) {
    console.error('Error verifying admin user:', error);
    return false;
  }
}
