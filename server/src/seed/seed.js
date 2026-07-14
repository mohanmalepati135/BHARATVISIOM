require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { User, Settings } = require('../models');
const { ROLES } = require('../constants');

/**
 * Minimal bootstrap: creates the first admin account (if it doesn't already
 * exist) and ensures the global settings document exists. No sample
 * prompts, images, or demo participants are created — the platform starts
 * completely empty and is populated entirely through the admin console.
 */
const run = async () => {
  await connectDB();

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@joshtalks.ai').toLowerCase();
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = await User.create({
      name: process.env.SEED_ADMIN_NAME || 'BharatVision Admin',
      email: adminEmail,
      password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!',
      role: ROLES.ADMIN,
    });
    console.log(`[Seed] Admin account created: ${adminEmail}`);
  } else {
    console.log(`[Seed] Admin account already exists: ${adminEmail}`);
  }

  const settingsExists = await Settings.findOne({ key: 'global' });
  if (!settingsExists) {
    await Settings.create({ key: 'global' });
    console.log('[Seed] Global settings document created.');
  }

  console.log('\n[Seed] Done. No sample prompts, images, or participants were created.');
  console.log('----------------------------------------');
  console.log(`Admin login: ${adminEmail} / ${process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!'}`);
  console.log('Change this password after your first login.');
  console.log('----------------------------------------\n');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});