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

  const metaData = await sheets.spreadsheets.get({ spreadsheetId });
  const tabs = (metaData.data.sheets?.map(s => s.properties?.title) || []).filter(t => t !== 'Summary' && t !== 'Template' && t !== 'admin_user' && t !== 'รวมวิชาการ');
  
  let totalAllocated = 0;
  let totalSpent = 0;
  const projects: any[] = [];

  if (tabs.length === 0) {
    return { groupId, totalAllocated: 0, totalSpent: 0, totalRemaining: 0, projects: [] };
  }

  const ranges = tabs.map(tab => `'${tab}'!A1:Z`);

  try {
    const batchResponse = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = batchResponse.data.valueRanges || [];

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const rows = valueRanges[i]?.values || [];
      if (rows.length === 0) continue;

      const headerRowIndex = rows.findIndex(r => r.some(cell => cell && (cell.toString().includes('วัน/เดือน/ปี') || cell.toString().includes('วันที่'))));
      const headerRow = headerRowIndex !== -1 ? rows[headerRowIndex] : [];
      
      const paidIndex = headerRow.findIndex(cell => cell === 'จ่าย' || cell === 'รายจ่าย');
      const receivedIndex = headerRow.findIndex(cell => cell === 'รับ' || cell === 'รายรับ');
      const remainingIndex = headerRow.findIndex(cell => cell === 'คงเหลือ');

      let allocated = 0;
      let projectName = tab;
      
      const projectNameRowOld = rows.find(r => r[0] && r[0].toString().includes('ชื่องาน/โครงการ:'));
      
      if (projectNameRowOld) {
         projectName = projectNameRowOld[0].toString().replace('ชื่องาน/โครงการ:', '').trim();
         if (projectNameRowOld.length >= 4) {
             allocated = parseFloat(projectNameRowOld[3].toString().replace(/,/g, '')) || 0;
         }
      } else {
         if (rows[0] && rows[0][0]) {
             const a1 = rows[0][0].toString();
             if (a1.includes('ทะเบียนคุมงบประมาณ')) {
                 projectName = a1.replace('ทะเบียนคุมงบประมาณ', '').replace('งาน', '').trim();
             }
         }
         if (headerRowIndex !== -1 && rows.length > headerRowIndex + 1) {
             const budgetRow = rows[headerRowIndex + 1];
             if (!budgetRow[1] && remainingIndex !== -1) {
                 allocated = parseFloat((budgetRow[remainingIndex] || '0').toString().replace(/,/g, '')) || 0;
             }
         }
      }

      let spent = 0;
      const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 9;
      for (let r = startIndex; r < rows.length; r++) {
         const row = rows[r];
         if (!row[1]) continue; 
         const paid = paidIndex !== -1 ? parseFloat((row[paidIndex] || '0').toString().replace(/,/g, '')) || 0 : 0;
         spent += paid;
      }

      totalAllocated += allocated;
      totalSpent += spent;

      projects.push({
        name: projectName,
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

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:Z`,
  });

  const rows = response.data.values || [];
  
  const headerRowIndex = rows.findIndex(r => r.some(cell => cell && (cell.toString().includes('วัน/เดือน/ปี') || cell.toString().includes('วันที่'))));
  const headerRow = headerRowIndex !== -1 ? rows[headerRowIndex] : [];
  
  const paidIndex = headerRow.findIndex(cell => cell === 'จ่าย' || cell === 'รายจ่าย');
  const receivedIndex = headerRow.findIndex(cell => cell === 'รับ' || cell === 'รายรับ');
  const remainingIndex = headerRow.findIndex(cell => cell === 'คงเหลือ');
  const noteIndex = headerRow.findIndex(cell => cell === 'หมายเหตุ');

  let allocated = 0;
  let projectName = tabName;
  
  const projectNameRowOld = rows.find(r => r[0] && r[0].toString().includes('ชื่องาน/โครงการ:'));
  
  if (projectNameRowOld) {
     projectName = projectNameRowOld[0].toString().replace('ชื่องาน/โครงการ:', '').trim();
     if (projectNameRowOld.length >= 4) {
         allocated = parseFloat(projectNameRowOld[3].toString().replace(/,/g, '')) || 0;
     }
  } else {
     if (rows[0] && rows[0][0]) {
         const a1 = rows[0][0].toString();
         if (a1.includes('ทะเบียนคุมงบประมาณ')) {
             projectName = a1.replace('ทะเบียนคุมงบประมาณ', '').replace('งาน', '').trim();
         }
     }
     if (headerRowIndex !== -1 && rows.length > headerRowIndex + 1) {
         const budgetRow = rows[headerRowIndex + 1];
         if (!budgetRow[1] && remainingIndex !== -1) {
             allocated = parseFloat((budgetRow[remainingIndex] || '0').toString().replace(/,/g, '')) || 0;
         }
     }
  }

  let spent = 0;
  const transactions: any[] = [];
  const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 9;
  
  for (let r = startIndex; r < rows.length; r++) {
     const row = rows[r];
     if (!row[1]) continue; 

     const received = receivedIndex !== -1 ? parseFloat((row[receivedIndex] || '0').toString().replace(/,/g, '')) || 0 : 0;
     const paid = paidIndex !== -1 ? parseFloat((row[paidIndex] || '0').toString().replace(/,/g, '')) || 0 : 0;
     const remaining = remainingIndex !== -1 ? parseFloat((row[remainingIndex] || '0').toString().replace(/,/g, '')) || 0 : 0;
     const note = noteIndex !== -1 ? (row[noteIndex] || '') : (row[row.length - 1] || '');

     spent += paid;

     transactions.push({
        id: r,
        no: row[0] || '',
        date: row[1] || '',
        description: row[2] || '',
        received,
        paid,
        remaining,
        note
     });
  }

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

  // ดึง Header มาตรวจสอบโครงสร้างคอลัมน์
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:Z10`,
  });
  
  const rows = response.data.values || [];
  const headerRowIndex = rows.findIndex(r => r.some(cell => cell && (cell.toString().includes('วัน/เดือน/ปี') || cell.toString().includes('วันที่'))));
  const headerRow = headerRowIndex !== -1 ? rows[headerRowIndex] : [];
  
  const paidIndex = headerRow.findIndex(cell => cell === 'จ่าย' || cell === 'รายจ่าย');
  const receivedIndex = headerRow.findIndex(cell => cell === 'รับ' || cell === 'รายรับ');
  const noteIndex = headerRow.findIndex(cell => cell === 'หมายเหตุ');
  
  // สร้าง Array เปล่าให้มีความยาวเท่ากับ Header
  const rowLength = Math.max(headerRow.length, 7);
  const rowData = new Array(rowLength).fill('');
  
  rowData[0] = data.no || '';
  rowData[1] = data.date || '';
  rowData[2] = data.description || '';
  
  if (receivedIndex !== -1) rowData[receivedIndex] = data.received || '';
  if (paidIndex !== -1) rowData[paidIndex] = data.paid || '';
  if (noteIndex !== -1) rowData[noteIndex] = data.note || '';

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${tabName}'!A1:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });

  return { success: true };
}
