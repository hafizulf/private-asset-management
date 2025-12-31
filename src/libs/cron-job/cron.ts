import { inject, injectable } from "inversify";
import { CronJob } from "cron";
import TYPES from "@/types";
import { RefreshTokenService } from "@/modules/refresh-tokens/refresh-token-service";
import { UserLogsService } from "@/modules/user-logs/user-logs-service";
import { BackUpService } from "@/modules/back-up/back-up.service";
import { JOB_KEYS } from "./cron-constants";

interface CronJobOptions {
  onComplete?: () => void;
  runOnInit?: boolean;
  timeZone?: string;
}

@injectable()
export class Cron {
  private _jobs: Record<string, CronJob> = {};

  constructor(
    @inject(TYPES.RefreshTokenService) private _refreshTokenService: RefreshTokenService,
    @inject(TYPES.UserLogsService) private _userLogsService: UserLogsService,
    @inject(TYPES.BackUpService) private _backupService: BackUpService,
  ) {
    this._addJob(
      JOB_KEYS.DELETE_EXPIRED_TOKENS,
      '0 0 * * *', // every day at midnight
      async () => {
        console.log("Running deleteExpiredTokens job at:", new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        await this._refreshTokenService.deleteExpiredTokens();
      }
    )

    this._addJob(
      JOB_KEYS.DELETE_USER_LOGS,
      '0 0 * * *',
      async () => {
        console.log("Running deleteUserLogs job at:", new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        await this._userLogsService.deleteOldUserLogs();
      }
    )

    // add another cron job
    this._addJob(
      JOB_KEYS.UPLOAD_DB_TO_GDRIVE,
      '0 2 * * *',
      async () => {
        console.log('Running another job at:', new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }))
        await this._backupService.backupAndUpload(process.env.DRIVE_FOLDER_ID!);
      }
    )
  }

  private _addJob(
    jobKey: string,
    cronExpression: string,
    callback: () => void,
    options: CronJobOptions = {}
  ) {
    this._jobs[jobKey] = new CronJob(
      cronExpression,
      callback,
      options.onComplete || null,
      options.runOnInit ?? false,
      options.timeZone ?? "Asia/Jakarta"
    )
  }

  public start(jobKey?: string) {
    if(jobKey) {
      if(this._jobs[jobKey] && !this._jobs[jobKey].isActive) {
        this._jobs[jobKey].start();
      }
    } else {
      Object.keys(this._jobs).forEach((key) => {
        if (!this._jobs[key]?.isActive) {
          this._jobs[key]?.start();
        }
      })
    }
  }

  public stop(jobKey?: string) {
    if(jobKey) {
      if(this._jobs[jobKey] && this._jobs[jobKey].isActive) {
        this._jobs[jobKey].stop();
      }
    } else {
      Object.keys(this._jobs).forEach((key) => {
        if (this._jobs[key]?.isActive) {
          this._jobs[key]?.stop();
        }
      })
    }
  }
}
