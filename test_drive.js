require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testDrive() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    
    const folderId = '1_xqDY_YSy8W4F3q00aTnSFdg8xH61mHy';
    console.log(`กำลังเชื่อมต่อ Google Drive โฟลเดอร์: ${folderId}`);
    
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType, size)',
    });
    
    const files = res.data.files;
    if (files.length === 0) {
      console.log('ไม่พบไฟล์ในโฟลเดอร์นี้ หรือบอทยังไม่มีสิทธิ์เข้าถึง (แชร์ถูกอีเมลหรือไม่?)');
    } else {
      console.log(`สำเร็จ! พบ ${files.length} ไฟล์ในโฟลเดอร์:\n`);
      files.forEach((file) => {
        if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
          console.log(`- ${file.name} | ID: ${file.id}`);
        }
      });
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error.message);
  }
}

testDrive();
