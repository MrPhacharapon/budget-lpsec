require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function checkNow() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SHEET_ID_ACADEMIC;

  console.log(`\n=== RECHECK at ${new Date().toISOString()} ===`);
  
  // Test 1: ดึงด้วย UNFORMATTED_VALUE (ค่าดิบจริงๆ ไม่ผ่านฟอร์แมต)
  console.log('\n--- Test 1: UNFORMATTED_VALUE ---');
  const res1 = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'7กิจกรรมนักเรียน'!A7:G7",
    valueRenderOption: 'UNFORMATTED_VALUE',
  });
  console.log('Row 7 raw data:', JSON.stringify(res1.data.values));

  // Test 2: ดึงด้วย FORMATTED_VALUE (ค่าที่แสดงในหน้าจอ)
  console.log('\n--- Test 2: FORMATTED_VALUE ---');
  const res2 = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'7กิจกรรมนักเรียน'!A7:G7",
    valueRenderOption: 'FORMATTED_VALUE',
  });
  console.log('Row 7 formatted data:', JSON.stringify(res2.data.values));
  
  // Test 3: ดึงด้วย FORMULA (ดูว่ามีสูตรอะไรซ่อนอยู่ไหม)
  console.log('\n--- Test 3: FORMULA ---');
  const res3 = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'7กิจกรรมนักเรียน'!A7:G7",
    valueRenderOption: 'FORMULA',
  });
  console.log('Row 7 formula data:', JSON.stringify(res3.data.values));
  
  // Test 4: ดึง Row 5-8 เทียบกัน
  console.log('\n--- Test 4: Rows 5-8 (FORMATTED_VALUE) ---');
  const res4 = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'7กิจกรรมนักเรียน'!A5:G8",
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const rows = res4.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    console.log(`Sheet Row ${i+5}: ${JSON.stringify(rows[i])}`);
  }
  
  // Test 5: เช็ค Version History / Revision ล่าสุด
  console.log('\n--- Test 5: Spreadsheet last modified ---');
  const drive = google.drive({ version: 'v3', auth });
  try {
    const fileInfo = await drive.files.get({
      fileId: spreadsheetId,
      fields: 'modifiedTime,lastModifyingUser',
    });
    console.log('Last modified:', fileInfo.data.modifiedTime);
    console.log('Last modified by:', JSON.stringify(fileInfo.data.lastModifyingUser));
  } catch(e) {
    console.log('Cannot access Drive API:', e.message);
  }
}

checkNow().catch(console.error);
