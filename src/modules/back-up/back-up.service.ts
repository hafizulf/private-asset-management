import { DB_CONFIG } from "@/config/env";
import { exec } from "child_process";
import { injectable } from "inversify";
import path from "path";
import fs from 'fs';

@injectable()
export class BackUpService {
  constructor() {}

  public async dumpPostgresDocker(): Promise<string> {
    const containerName = 'postgres17_asset_management_sys';
    const { db_name, db_user } = DB_CONFIG;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // project root / backup folder
    const projectRoot = path.resolve(__dirname, '../../..');
    const backupDir = path.join(projectRoot, 'backup');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const backupFile = path.join(backupDir, `backup_${db_name}_${timestamp}.sql`);

    return new Promise((resolve, reject) => {
      const command = `docker exec ${containerName} pg_dump -U ${db_user} ${db_name}`;
      exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
        if (error) return reject(error);
        if (stderr) console.log('pg_dump stderr:', stderr);

        fs.writeFileSync(backupFile, stdout);
        resolve(backupFile);
      });
    });
  }

  public async backUpFullDatabaseToGDrive() {
    console.log("Memulai proses backup database ke google drive...");

    const backupFile = await this.dumpPostgresDocker();
    console.log("backup file", backupFile);

    console.log(`Proses backup selesai.`);
  }
}