import cron from 'node-cron';
import mongoose from 'mongoose';

/**
 * MongoDB Keep-Alive Cron Job
 *
 * MongoDB Atlas M0 (free tier) auto-pauses clusters after 60 days of inactivity.
 * This cron job pings the database daily to prevent that from happening.
 *
 * Schedule: Every day at 08:00 AM (server timezone)
 */
export const startCronJobs = () => {
  // ─── Daily MongoDB Keep-Alive Ping ──────────────────────────────────────────
  cron.schedule('0 8 * * *', async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        const result = await mongoose.connection.db.admin().command({ ping: 1 });
        console.log(`[CRON ✅] ${new Date().toISOString()} — MongoDB keep-alive ping successful`, result);
      } else {
        console.warn(`[CRON ⚠️] ${new Date().toISOString()} — MongoDB not connected, skipping ping`);
      }
    } catch (error) {
      console.error(`[CRON ❌] ${new Date().toISOString()} — Keep-alive ping failed:`, error.message);
    }
  }, {
    timezone: 'Asia/Jakarta', // WIB timezone
  });

  // ─── Every 6 Hours Ping (extra safety) ──────────────────────────────────────
  cron.schedule('0 */6 * * *', async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log(`[CRON 💓] ${new Date().toISOString()} — Heartbeat ping OK`);
      }
    } catch (error) {
      console.error(`[CRON ❌] Heartbeat ping failed:`, error.message);
    }
  });

  console.log('⏰ Cron jobs started:');
  console.log('   → Daily keep-alive: every day at 08:00 AM WIB');
  console.log('   → Heartbeat: every 6 hours');
};
