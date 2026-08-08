import { NextResponse } from 'next/server';
import { addTransaction, updateTransaction, deleteTransaction, reorderTransaction, logAdminAction } from '@/lib/googleSheets';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, groupId, tabName, rowIndex, data, sourceIndex, destinationIndex } = body;

    let result;

    if (action === 'create') {
      result = await addTransaction(groupId, tabName, data);
      await logAdminAction(session.username, 'CREATE', groupId, tabName, `Added transaction: ${data.description || data.no}`);
    } else if (action === 'update') {
      result = await updateTransaction(groupId, tabName, rowIndex, data);
      await logAdminAction(session.username, 'UPDATE', groupId, tabName, `Updated transaction at row index ${rowIndex}`);
    } else if (action === 'delete') {
      result = await deleteTransaction(groupId, tabName, rowIndex);
      await logAdminAction(session.username, 'DELETE', groupId, tabName, `Deleted transaction at row index ${rowIndex}`);
    } else if (action === 'reorder') {
      result = await reorderTransaction(groupId, tabName, sourceIndex, destinationIndex);
      await logAdminAction(session.username, 'REORDER', groupId, tabName, `Moved row from index ${sourceIndex} to ${destinationIndex}`);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('CRUD Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
