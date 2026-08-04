require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function readSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_ID_ACADEMIC;

    console.log(`กำลังเชื่อมต่อ Google Sheets ID: ${spreadsheetId}`);
    
    // ดึงข้อมูล Metadata เพื่อดูชื่อแผ่นงาน (Tabs)
    const metaData = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    console.log(`ชื่อไฟล์: ${metaData.data.properties.title}`);
    console.log(`พบแผ่นงาน (Tabs) จำนวน ${metaData.data.sheets.length} แผ่น:`);
    
    // อ่านข้อมูลจากแผ่นงานแรกสุด
    const firstSheetName = metaData.data.sheets[0].properties.title;
    console.log(`\nกำลังอ่านข้อมูลจากแผ่นงาน: "${firstSheetName}" (บรรทัดที่ 1-10)...`);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${firstSheetName}'!A1:Z10`, // ดึง 10 บรรทัดแรก
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('ไม่พบข้อมูลในแผ่นงานนี้');
    } else {
      rows.forEach((row, index) => {
        console.log(`บรรทัดที่ ${index + 1}: ${row.join(' | ')}`);
      });
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error.message);
  }
}

readSheet();
