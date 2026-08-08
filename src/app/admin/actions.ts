'use server';

import { getGroupSummary, getProjectDetails, sheetIds } from '@/lib/googleSheets';
import { getSession } from '@/lib/session';

export async function fetchGroupSummaryAction(groupId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  if (!sheetIds[groupId as keyof typeof sheetIds]) {
    throw new Error('Group not found');
  }

  return await getGroupSummary(groupId as keyof typeof sheetIds);
}

export async function fetchProjectDetailsAction(groupId: string, tabName: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  return await getProjectDetails(groupId as keyof typeof sheetIds, tabName);
}
