import { inject, injectable } from "inversify";
import { Cron } from "@/libs/cron-job/cron";
import { JOB_KEYS } from "@/libs/cron-job/cron-constants";

@injectable()
export class BackgroundServiceManager {
  constructor(
    @inject(Cron) private cronJobs: Cron,
  ) {}

  async startServices(): Promise<void> {
    this.initializeCronJobs();
    // Add more background service initializations here if needed
  }

  private initializeCronJobs(): void {
    this.cronJobs.start(JOB_KEYS.UPLOAD_DB_TO_GDRIVE);

    console.log('Background cron jobs initialized.');
  }
}
