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
  const tabs = metaData.data.sheets?.map(s => s.properties?.title) || [];
  
  if (!tabs.includes('Log')) {
    console.log('Creating Log tab...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Log',
              }
            }
          }
        ]
      }
    });
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "'Log'!A1:F1",
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Timestamp', 'Admin User', 'Action', 'Group', 'Project/Tab', 'Details']]
      }
    });
    console.log('Log tab created with headers.');
  } else {
    console.log('Log tab already exists.');
  }
}

main().catch(console.error);
