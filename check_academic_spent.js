require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function verify() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SHEET_ID_ACADEMIC;

  // เช็ค Row 7 ว่าลบแล้วจริงไหม
  console.log('=== Verify Row 7 deleted ===');
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'7กิจกรรมนักเรียน'!A5:G8",
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    console.log(`Sheet Row ${i+5}: ${JSON.stringify(rows[i])}`);
  }

  // คำนวณยอดรวมใช้ไปใหม่ทั้งกลุ่มวิชาการ
  console.log('\n=== Recalculate Total Spent ===');
  const metaData = await sheets.spreadsheets.get({ spreadsheetId });
  const allTabs = metaData.data.sheets.map(s => s.properties.title);
  const tabs = allTabs.filter(t => t !== 'Summary' && t !== 'Template' && t !== 'admin_user' && !t.startsWith('รวม'));
  
  const ranges = tabs.map(tab => `'${tab}'!A1:Z`);
  const batchResponse = await sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges });
  
  let totalSpent = 0;
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    const tabRows = batchResponse.data.valueRanges[i]?.values || [];
    if (tabRows.length === 0) continue;
    
    const headerRowIndex = tabRows.findIndex(r => r.some(cell => cell && (cell.toString().includes('วัน/เดือน/ปี') || cell.toString().includes('วันที่'))));
    const headerRow = headerRowIndex !== -1 ? tabRows[headerRowIndex] : [];
    const paidIndex = headerRow.findIndex(cell => {
       const text = (cell || '').toString().trim();
       return text === 'จ่าย' || text === 'รายจ่าย';
    });
    
    let spent = 0;
    const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 9;
    for (let r = startIndex; r < tabRows.length; r++) {
       const row = tabRows[r];
       if (!row[1]) continue;
       const paid = paidIndex !== -1 ? parseFloat((row[paidIndex] || '0').toString().replace(/,/g, '')) || 0 : 0;
       spent += paid;
    }
    if (spent > 0) {
      console.log(`  ${tab}: ${spent.toLocaleString('th-TH', {minimumFractionDigits: 2})} บาท`);
    }
    totalSpent += spent;
  }
  
  console.log(`\n  Grand Total Spent: ${totalSpent.toLocaleString('th-TH', {minimumFractionDigits: 2})} บาท`);
  console.log(`  (Google Sheet รวมวิชาการ แสดง: 92,304.89 บาท)`);
  console.log(`  ตรงกัน: ${Math.abs(totalSpent - 92304.89) < 0.01 ? '✅ ใช่!' : '❌ ยังไม่ตรง (ห่าง ' + (totalSpent - 92304.89).toFixed(2) + ' บาท)'}`);
}

verify().catch(console.error);
