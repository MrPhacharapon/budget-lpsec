import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export const sheetIds = {
  academic: process.env.SHEET_ID_ACADEMIC,
  planning: process.env.SHEET_ID_PLANNING,
  personnel: process.env.SHEET_ID_PERSONNEL,
  general: process.env.SHEET_ID_GENERAL,
  admin: process.env.SHEET_ID_ADMIN,
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
  const allTabs = metaData.data.sheets?.map((s: any) => s.properties?.title) || [];
  const summaryTabName = allTabs.find((t: string | undefined | null) => t && t.startsWith('รวม'));
  const tabs = allTabs.filter((t: string | undefined | null) => t && t !== 'Summary' && t !== 'Template' && t !== 'admin_user' && !t.startsWith('รวม'));
  
  let totalAllocated = 0;
  let totalSpent = 0;
  let jobCount = 0;
  let projectCount = 0;
  const projects: any[] = [];

  if (tabs.length === 0) {
    return { groupId, totalAllocated: 0, totalSpent: 0, totalRemaining: 0, projects: [], hasDiscrepancy: false, jobCount: 0, projectCount: 0 };
  }

  const ranges = tabs.map((tab: string) => `'${tab}'!A1:Z`);
  if (summaryTabName) {
    ranges.push(`'${summaryTabName}'!A1:Z`);
  }

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
      
      const paidIndex = headerRow.findIndex(cell => {
         const text = (cell || '').toString().trim();
         return text === 'จ่าย' || text === 'รายจ่าย';
      });
      const receivedIndex = headerRow.findIndex(cell => {
         const text = (cell || '').toString().trim();
         return text === 'รับ' || text === 'รายรับ';
      });
      const remainingIndex = headerRow.findIndex(cell => {
         const text = (cell || '').toString().trim();
         return text === 'คงเหลือ';
      });

      let allocated = 0;
      let projectName = tab;
      
      const projectNameRowOld = rows.find(r => r[0] && r[0].toString().includes('ชื่องาน/โครงการ:'));
      
      if (projectNameRowOld) {
         projectName = projectNameRowOld[0].toString().replace('ชื่องาน/โครงการ:', '').trim();
         if (projectNameRowOld.length >= 4) {
             allocated = parseFloat(projectNameRowOld[3].toString().replace(/[, \s]/g, '')) || 0;
         }
      } else {
         if (rows[0] && rows[0][0]) {
             const a1 = rows[0][0].toString();
             if (a1.includes('ทะเบียนคุมงบประมาณ')) {
                 projectName = a1.replace('ทะเบียนคุมงบประมาณ', '').trim();
             }
         }
         if (headerRowIndex !== -1 && rows.length > headerRowIndex + 1) {
             const budgetRow = rows[headerRowIndex + 1];
             if (!budgetRow[1] && remainingIndex !== -1) {
                 allocated = parseFloat((budgetRow[remainingIndex] || '0').toString().replace(/[, \s]/g, '')) || 0;
             }
         }
      }

      let spent = 0;
      const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 9;
      for (let r = startIndex; r < rows.length; r++) {
         const row = rows[r];
         const hasDate = !!row[1];
         const hasDesc = !!row[2];
         const receivedVal = receivedIndex !== -1 ? (row[receivedIndex] || '').toString().trim() : '';
         const paidVal = paidIndex !== -1 ? (row[paidIndex] || '').toString().trim() : '';
         
         if (!hasDate && !hasDesc && receivedVal === '' && paidVal === '') continue;
         
         const isTotalRow = !hasDate && row.some(cell => cell && cell.toString().includes('รวม'));
         if (isTotalRow) continue;
         
         const paid = paidIndex !== -1 ? parseFloat((row[paidIndex] || '0').toString().replace(/[, \s]/g, '')) || 0 : 0;
         spent += paid;
      }

      totalAllocated += allocated;
      totalSpent += spent;

      if (projectName.includes('โครงการ')) {
        projectCount++;
      } else if (projectName.includes('งาน')) {
        jobCount++;
      } else {
        // Fallback for names that might not explicitly contain the word but are tabs
        projectCount++;
      }

      projects.push({
        name: projectName,
        tabName: tab,
        allocated,
        spent,
        remaining: allocated - spent
      });
    }

    let summaryAllocated = null;
    let summarySpent = null;
    if (summaryTabName && valueRanges.length > tabs.length) {
      const summaryRows = valueRanges[tabs.length]?.values || [];
      const totalRow = summaryRows.find(r => r[0] && r[0].toString().trim() === 'รวม');
      if (totalRow) {
        summaryAllocated = parseFloat((totalRow[2] || '0').toString().replace(/[, \s]/g, '')) || 0;
        summarySpent = parseFloat((totalRow[3] || '0').toString().replace(/[, \s]/g, '')) || 0;
      }
    }

    const isAllocatedMismatch = summaryAllocated !== null && Math.abs(summaryAllocated - totalAllocated) > 0.01;
    const isSpentMismatch = summarySpent !== null && Math.abs(summarySpent - totalSpent) > 0.01;
    const hasDiscrepancy = isAllocatedMismatch || isSpentMismatch;

    return {
      groupId,
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      projects,
      summaryAllocated,
      summarySpent,
      hasDiscrepancy,
      isAllocatedMismatch,
      isSpentMismatch,
      jobCount,
      projectCount
    };
  } catch (e: any) {
    console.error(`Error batch fetching for ${groupId}:`, e.message);
    return {
      groupId,
      totalAllocated: 0,
      totalSpent: 0,
      totalRemaining: 0,
      projects: [],
      hasDiscrepancy: false,
      jobCount: 0,
      projectCount: 0
    };
  }
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
  
  const paidIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'จ่าย' || text === 'รายจ่าย';
  });
  const receivedIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'รับ' || text === 'รายรับ';
  });
  const remainingIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'คงเหลือ';
  });
  const noteIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'หมายเหตุ';
  });

  let allocated = 0;
  let projectName = tabName;
  
  const projectNameRowOld = rows.find(r => r[0] && r[0].toString().includes('ชื่องาน/โครงการ:'));
  
  if (projectNameRowOld) {
     projectName = projectNameRowOld[0].toString().replace('ชื่องาน/โครงการ:', '').trim();
     if (projectNameRowOld.length >= 4) {
         allocated = parseFloat(projectNameRowOld[3].toString().replace(/[, \s]/g, '')) || 0;
     }
  } else {
     if (rows[0] && rows[0][0]) {
         const a1 = rows[0][0].toString();
         if (a1.includes('ทะเบียนคุมงบประมาณ')) {
             projectName = a1.replace('ทะเบียนคุมงบประมาณ', '').trim();
         }
     }
     if (headerRowIndex !== -1 && rows.length > headerRowIndex + 1) {
         const budgetRow = rows[headerRowIndex + 1];
         if (!budgetRow[1] && remainingIndex !== -1) {
             allocated = parseFloat((budgetRow[remainingIndex] || '0').toString().replace(/[, \s]/g, '')) || 0;
         }
     }
  }

  let spent = 0;
  const transactions: any[] = [];
  const startIndex = headerRowIndex !== -1 ? headerRowIndex + 1 : 9;
  
  for (let r = startIndex; r < rows.length; r++) {
     const row = rows[r];
     
     const hasDate = !!row[1];
     const hasDesc = !!row[2];
     const receivedVal = receivedIndex !== -1 ? (row[receivedIndex] || '').toString().trim() : '';
     const paidVal = paidIndex !== -1 ? (row[paidIndex] || '').toString().trim() : '';
     
     // Skip if no date, no description, no received, and no paid amount
     if (!hasDate && !hasDesc && receivedVal === '' && paidVal === '') continue;
     
     // Skip if row is a total row (contains 'รวม' and has no date)
     const isTotalRow = !hasDate && row.some(cell => cell && cell.toString().includes('รวม'));
     if (isTotalRow) continue;
     
     const received = parseFloat(receivedVal.replace(/[, \s]/g, '')) || 0;
     const paid = parseFloat(paidVal.replace(/[, \s]/g, '')) || 0;
     const remaining = remainingIndex !== -1 ? parseFloat((row[remainingIndex] || '0').toString().replace(/[, \s]/g, '')) || 0 : 0;
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
  
  const paidIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'จ่าย' || text === 'รายจ่าย';
  });
  const receivedIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'รับ' || text === 'รายรับ';
  });
  const noteIndex = headerRow.findIndex(cell => {
     const text = (cell || '').toString().trim();
     return text === 'หมายเหตุ';
  });
  
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

export async function getAdminUsers() {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds.admin;
  if (!spreadsheetId) throw new Error('ไม่พบ Spreadsheet ID สำหรับ Admin');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'admin_user'!A2:C",
  });

  const rows = response.data.values || [];
  return rows.map(r => ({
    username: r[0] || '',
    password: r[1] || '',
    displayName: r[2] || '',
  }));
}

export async function logAdminAction(adminUser: string, action: string, group: string, project: string, details: string) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds.admin;
  if (!spreadsheetId) return;

  const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const rowData = [timestamp, adminUser, action, group, project, details];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "'Log'!A1:F",
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [rowData],
    },
  });
}

export async function updateTransaction(groupId: keyof typeof sheetIds, tabName: string, rowIndex: number, data: any) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds[groupId];
  if (!spreadsheetId) throw new Error('ไม่พบ Spreadsheet ID');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${tabName}'!A1:Z10`,
  });
  const rows = response.data.values || [];
  const headerRowIndex = rows.findIndex(r => r.some(cell => cell && (cell.toString().includes('วัน/เดือน/ปี') || cell.toString().includes('วันที่'))));
  const headerRow = headerRowIndex !== -1 ? rows[headerRowIndex] : [];
  
  const paidIndex = headerRow.findIndex(c => (c || '').toString().trim() === 'จ่าย' || (c || '').toString().trim() === 'รายจ่าย');
  const receivedIndex = headerRow.findIndex(c => (c || '').toString().trim() === 'รับ' || (c || '').toString().trim() === 'รายรับ');
  const noteIndex = headerRow.findIndex(c => (c || '').toString().trim() === 'หมายเหตุ');

  const rowLength = Math.max(headerRow.length, 7);
  const rowData = new Array(rowLength).fill('');
  
  rowData[0] = data.no || '';
  rowData[1] = data.date || '';
  rowData[2] = data.description || '';
  
  if (receivedIndex !== -1) rowData[receivedIndex] = data.received || '';
  if (paidIndex !== -1) rowData[paidIndex] = data.paid || '';
  if (noteIndex !== -1) rowData[noteIndex] = data.note || '';

  const actualRow = rowIndex + 1;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tabName}'!A${actualRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowData] },
  });
  return { success: true };
}

export async function deleteTransaction(groupId: keyof typeof sheetIds, tabName: string, rowIndex: number) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds[groupId];
  if (!spreadsheetId) throw new Error('ไม่พบ Spreadsheet ID');
  
  const metaData = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = metaData.data.sheets?.find(s => s.properties?.title === tabName);
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined) throw new Error('Sheet not found');

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }
      ]
    }
  });
  return { success: true };
}

export async function reorderTransaction(groupId: keyof typeof sheetIds, tabName: string, sourceIndex: number, destinationIndex: number) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = sheetIds[groupId];
  if (!spreadsheetId) throw new Error('ไม่พบ Spreadsheet ID');
  
  const metaData = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = metaData.data.sheets?.find(s => s.properties?.title === tabName);
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined) throw new Error('Sheet not found');

  let destination = destinationIndex;
  if (sourceIndex < destinationIndex) {
    destination = destinationIndex + 1;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          moveDimension: {
            source: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: sourceIndex,
              endIndex: sourceIndex + 1
            },
            destinationIndex: destination
          }
        }
      ]
    }
  });
  return { success: true };
}
