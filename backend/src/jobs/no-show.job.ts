import cron from 'node-cron';

import { markCompletedReservations, markNoShows } from '../services/check-in.service.js';

export function startNoShowScheduler(): void {
  cron.schedule('* * * * *', async () => {
    try {
      const released = await markNoShows();
      await markCompletedReservations();
      if (released > 0) console.log(`Released ${released} no-show reservation(s).`);
    } catch (error) {
      console.error('No-show scheduler failed.', error);
    }
  });
}
