import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const sheetIds = {
  academic: process.env.SHEET_ID_ACADEMIC,
  planning: process.env.SHEET_ID_PLANNING,
  personnel: process.env.SHEET_ID_PERSONNEL,
  general: process.env.SHEET_ID_GENERAL,
};

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
}

export async function getGroupSummary(groupId: keyof typeof sheetIds) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds[groupId];

  if (!spreadsheetId) {
    throw new Error(`ไม่พบ Spreadsheet ID สำหรับกลุ่มงาน ${groupId}`);
  }

  // ดึงรายชื่อแท็บ (Projects) ทั้งหมดในไฟล์
  const metaData = await sheets.spreadsheets.get({ spreadsheetId });
  const tabs = (metaData.data.sheets?.map(s => s.properties?.title) || []).filter(t => t !== 'Summary' && t !== 'Template' && t !== 'admin_user');
  
  let totalAllocated = 0;
  let totalSpent = 0;
  const projects: any[] = [];

  if (tabs.length === 0) {
    return { groupId, totalAllocated: 0, totalSpent: 0, totalRemaining: 0, projects: [] };
  }

  // สร้าง ranges สำหรับ batchGet
  const ranges = tabs.flatMap(tab => [`'${tab}'!A3:I10`, `'${tab}'!A10:H`]);

  try {
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = batchResponse.data.valueRanges || [];

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const headerRows = valueRanges[i * 2]?.values || [];
      const expenseRows = valueRanges[i * 2 + 1]?.values || [];

      // โครงสร้างไฟล์: A3 = ชื่องาน/โครงการ: XXX, D3 = งบประมาณที่ได้รับ: YYY
      const projectNameRow = headerRows.find(r => r[0] && r[0].includes('ชื่องาน/โครงการ:'));
      const allocatedStr = projectNameRow && projectNameRow.length >= 4 ? projectNameRow[3] : '0';
      const allocated = parseFloat(allocatedStr.toString().replace(/,/g, '')) || 0;

      let spent = 0;
      expenseRows.forEach(row => {
        if (row[5]) { // คอลัมน์ F (จำนวนเงิน)
          spent += parseFloat(row[5].toString().replace(/,/g, '')) || 0;
        }
      });

      totalAllocated += allocated;
      totalSpent += spent;

      projects.push({
        name: projectNameRow ? projectNameRow[0].replace('ชื่องาน/โครงการ:', '').trim() : tab,
        tabName: tab,
        allocated,
        spent,
        remaining: allocated - spent
      });
    }
  } catch (e: any) {
    console.error(`Error batch fetching for ${groupId}:`, e.message);
  }

  return {
    groupId,
    totalAllocated,
    totalSpent,
    totalRemaining: totalAllocated - totalSpent,
    projects
  };
}

export async function getProjectDetails(groupId: keyof typeof sheetIds, tabName: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds[groupId];

  if (!spreadsheetId) {
    throw new Error(`ไม่พบ Spreadsheet ID สำหรับกลุ่มงาน ${groupId}`);
  }

  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: [`'${tabName}'!A3:I10`, `'${tabName}'!A10:H`],
  });

  const headerRows = response.data.valueRanges?.[0]?.values || [];
  const expenseRows = response.data.valueRanges?.[1]?.values || [];

  const projectNameRow = headerRows.find(r => r[0] && r[0].includes('ชื่องาน/โครงการ:'));
  const projectName = projectNameRow ? projectNameRow[0].replace('ชื่องาน/โครงการ:', '').trim() : tabName;
  const allocatedStr = projectNameRow && projectNameRow.length >= 4 ? projectNameRow[3] : '0';
  const allocated = parseFloat(allocatedStr.toString().replace(/,/g, '')) || 0;

  let spent = 0;
  const transactions = expenseRows.filter(r => r[1]).map((row, index) => { // กรองเฉพาะแถวที่มีวันที่
    const received = parseFloat(row[4]?.toString().replace(/,/g, '')) || 0;
    const paid = parseFloat(row[5]?.toString().replace(/,/g, '')) || 0;
    spent += paid;
    return {
      id: index,
      no: row[0] || '',
      date: row[1] || '',
      description: row[2] || row[3] || '',
      received,
      paid,
      remaining: parseFloat(row[6]?.toString().replace(/,/g, '')) || 0,
      note: row[7] || '',
    };
  });

  return {
    groupId,
    tabName,
    projectName,
    allocated,
    spent,
    remaining: allocated - spent,
    transactions
  };
}

export async function addTransaction(groupId: keyof typeof sheetIds, tabName: string, data: any) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds[groupId];

  if (!spreadsheetId) {
    throw new Error(`ไม่พบ Spreadsheet ID สำหรับกลุ่มงาน ${groupId}`);
  }

  // รูปแบบแถว: [ลำดับที่, วันที่, รายการ, ว่าง, รับ, จ่าย, คงเหลือ(ปล่อยให้สูตรคำนวณ หรือส่งไปอัปเดต), หมายเหตุ]
  const rowData = [
    data.no || '',
    data.date || '',
    data.description || '',
    '', // คอลัมน์ C/D ใช้ merge กันในไฟล์เก่า
    data.received || '',
    data.paid || '',
    '', // คงเหลือ - ในไฟล์จริงมักจะเป็นสูตร เราอาจเว้นไว้เพื่อให้ผู้ใช้ลากสูตร หรือคำนวณให้
    data.note || ''
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tabName}'!A10:H`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });

  return { success: true };
}
