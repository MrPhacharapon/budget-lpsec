import { NextResponse } from 'next/server';
import { addTransaction, sheetIds } from '@/lib/googleSheets';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { groupId, tabName, data } = body;

    if (!groupId || !tabName || !data) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    if (!sheetIds[groupId as keyof typeof sheetIds]) {
      return NextResponse.json({ error: 'ไม่พบกลุ่มงานที่ระบุ' }, { status: 404 });
    }

    await addTransaction(groupId as keyof typeof sheetIds, tabName, data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}
