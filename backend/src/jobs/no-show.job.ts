import cron from 'node-cron';

import { markCompletedReservations, markNoShows } from '../services/check-in.service.js';

let jobIsRunning = false;

export function startNoShowScheduler(): void {
  void runMaintenance();
  cron.schedule('* * * * *', () => void runMaintenance());
}

async function runMaintenance(): Promise<void> {
  if (jobIsRunning) return;

  jobIsRunning = true;
  try {
    const released = await markNoShows();
    const completed = await markCompletedReservations();
    if (released || completed) {
      console.log(`Booking maintenance: ${released} no-show release(s), ${completed} completion(s).`);
    }
  } catch (error) {
    console.error('Booking maintenance failed.', error);
  } finally {
    jobIsRunning = false;
  }
}
