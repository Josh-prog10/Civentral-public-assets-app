import { submitWaterRequestToSql } from '@/src/services/civentralSqlDatabase';
import type { RequestFormData, SubmitResult } from '../types';

export async function submitWaterRequest(
  data: RequestFormData
): Promise<SubmitResult> {
  try {
    return await submitWaterRequestToSql(data);
  } catch {
    return { success: false, message: 'Failed to submit request. Please try again.' };
  }
}