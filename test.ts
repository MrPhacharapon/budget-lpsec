import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SHEET_ID_ADMIN;

  const metaData = await sheets.spreadsheets.get({ spreadsheetId });
  const tabs = metaData.data.sheets?.map(s => ({ title: s.properties?.title, sheetId: s.properties?.sheetId })) || [];
  console.log('Tabs:', tabs);

  const targetTab = tabs.find(t => t.sheetId === 954745703) || tabs[0];
  console.log('Target Tab for GID 954745703:', targetTab);

  if (targetTab && targetTab.title) {
    const data = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${targetTab.title}'!A1:Z20`,
    });
    console.log('Data:', data.data.values);
  }
}

main().catch(console.error);
