import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import path from 'path';

async function bootstrapAuth() {
  const PROJECT_ROOT = path.resolve(__dirname, '../..');
  const CREDENTIALS_PATH = path.join(
    PROJECT_ROOT,
    'oauth-client.json'
  );
  const TOKEN_PATH = path.join(
    PROJECT_ROOT,
    'token.json'
  );
  const credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, 'utf8')
  );

  const { client_id, client_secret } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost'
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });

  console.log('Open this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise<string>((resolve) =>
    rl.question('Code: ', resolve)
  );

  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  console.log('token.json generated in', TOKEN_PATH);
}

bootstrapAuth();
