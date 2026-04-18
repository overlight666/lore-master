#!/usr/bin/env node

/**
 * Setup Admin User Script
 * This script sets up an admin user with proper permissions
 * 
 * Usage: npm run setup-admin
 */

import { setupAdminUser, verifyAdminUser } from '../utils/setupAdmin';

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@loremaster.com';
  const adminRole = (process.env.ADMIN_ROLE || 'admin') as 'admin' | 'super_admin';
  
  console.log('🔧 Admin User Setup Script');
  console.log('==========================');
  console.log(`Email: ${adminEmail}`);
  console.log(`Role: ${adminRole}`);
  console.log('');
  
  // First verify if already set up
  console.log('1. Checking current setup...');
  const isAlreadySetup = await verifyAdminUser(adminEmail);
  
  if (isAlreadySetup) {
    console.log('✅ Admin user is already properly set up!');
    process.exit(0);
  }
  
  // Setup the admin user
  console.log('2. Setting up admin user...');
  const success = await setupAdminUser(adminEmail, adminRole);
  
  if (success) {
    console.log('');
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Sign out of your admin account');
    console.log('2. Sign back in to refresh the token');
    console.log('3. Try accessing the admin dashboard');
  } else {
    console.log('❌ Setup failed. Check the logs above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
