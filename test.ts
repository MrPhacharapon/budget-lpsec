import { google } from 'googleapis';

const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1nK7NfyDp55NIIopLpg0RCnLAyzKGlosAwGVoAN2lGnE'; // Planning
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'6ทุนการศึกษา'!A1:Z",
  });
  
  const rows = response.data.values || [];
  console.log('Last 5 rows of 6ทุนการศึกษา:');
  console.log(JSON.stringify(rows.slice(-5), null, 2));
}

main().catch(console.error);
