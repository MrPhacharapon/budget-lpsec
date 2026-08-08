import { NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/googleSheets';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminUsers = await getAdminUsers();
    
    // Find matching user
    const user = adminUsers.find(u => u.username === username && u.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Username หรือ Password ไม่ถูกต้อง' }, { status: 401 });
    }

    // Create session
    const expires = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 hours
    const sessionData = { username: user.username, displayName: user.displayName, expires };
    const session = await encrypt(sessionData);

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires,
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true, user: { username: user.username, displayName: user.displayName } });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
