import { app } from './app.js';
import { environment } from './config/environment.js';
import { startNoShowScheduler } from './jobs/no-show.job.js';

startNoShowScheduler();
app.listen(environment.port, () => {
  console.log(`Backend is running at http://localhost:${environment.port}`);
});
