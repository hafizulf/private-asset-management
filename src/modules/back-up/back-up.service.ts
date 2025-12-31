import { DB_CONFIG } from "@/config/env";
import { exec } from "child_process";
import { injectable } from "inversify";
import path from "path";
import fs from 'fs';
import { drive_v3, google } from 'googleapis';
import readline from 'readline';

@injectable()
export class BackUpService {
  private SCOPES = ['https://www.googleapis.com/auth/drive.file'];
  private TOKEN_PATH = path.join(__dirname, '../../../token.json');
  private CREDENTIALS_PATH = path.join(__dirname, '../../../oauth-client.json');

  constructor() {}

  private async authorize() {
    const credentials = JSON.parse(
      fs.readFileSync(this.CREDENTIALS_PATH, 'utf8')
    );

    if (!credentials.installed) {
      throw new Error(
        'Invalid OAuth client: expected Desktop App credentials (installed)'
      );
    }

    const {
      client_id,
      client_secret,
      redirect_uris,
    } = credentials.installed;

    if (!redirect_uris || redirect_uris.length === 0) {
      throw new Error('Desktop OAuth client has no redirect_uris');
    }

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    if (fs.existsSync(this.TOKEN_PATH)) {
      oAuth2Client.setCredentials(
        JSON.parse(fs.readFileSync(this.TOKEN_PATH, 'utf8'))
      );
      return oAuth2Client;
    }

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
    });

    console.log('Authorize this app by visiting this URL:', authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const code = await new Promise<string>((resolve) => {
      rl.question('Enter the code here: ', (c) => {
        rl.close();
        resolve(c);
      });
    });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(tokens));

    return oAuth2Client;
  }

  public async dumpPostgresDocker(): Promise<string> {
    const containerName = 'postgres17_asset_management_sys';
    const { db_name, db_user } = DB_CONFIG;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

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

  public async uploadToGDrive(localFilePath: string, folderId: string): Promise<drive_v3.Schema$File> {
    const auth = await this.authorize();
    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: path.basename(localFilePath),
      parents: [folderId],
    };

    const media = {
      mimeType: 'application/octet-stream',
      body: fs.createReadStream(localFilePath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name',
    });

    console.log('Uploaded file ID:', response.data.id);
    console.log('Uploaded file name:', response.data.name);

    return response.data;
  }

  public async backupAndUpload(folderId: string): Promise<drive_v3.Schema$File> {
    try {
      const backupFile = await this.dumpPostgresDocker();
      console.log('Backup created at:', backupFile);

      return await this.uploadToGDrive(backupFile, folderId);
    } catch (err) {
      console.error('Backup/upload failed:', err);
      throw err;
    }
  }
}
