require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function checkSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const ids = [
    '12NYRQryl-AItMjX60C23_c9s7hSzls0n6s2pCUbZGgk',
    '12-KiDg_ESuYXWgpvtiVWn2Hk2GCOBukCf_5MNtwG6ss',
    '1s3dE-164bvfoFuQSLyH_tPfMevBy8geb2WEl5G-QJfY',
    '1nJC67LmIeUzPpHH0-FAkNvRF9QXvasioW_bPXk7pBSw'
  ];

  for (const id of ids) {
    try {
      const metaData = await sheets.spreadsheets.get({ spreadsheetId: id });
      console.log(`\n\n=== Title: ${metaData.data.properties.title} ===`);
      const tabs = metaData.data.sheets.map(s => s.properties.title);
      const summaryTab = tabs.find(t => t.startsWith('รวม'));
      
      if (summaryTab) {
         console.log(`--- SUMMARY TAB: ${summaryTab} ---`);
         const res = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: `'${summaryTab}'!A1:Z30` });
         const rows = res.data.values || [];
         rows.forEach((r, i) => console.log(`Row ${i+1}: ${r.join(' | ')}`));
      }
    } catch(e) {
      console.error(e.message);
    }
  }
}

checkSheets();
