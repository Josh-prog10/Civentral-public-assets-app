import type { ReservationStatus } from '../types';

export function getStatusColor(status: ReservationStatus): string {
  switch (status) {
    case 'Pending':
      return '#F59E0B';
    case 'Confirmed':
      return '#10B981';
    case 'Completed':
      return '#3B82F6';
    case 'Cancelled':
      return '#EF4444';
    default:
      return '#6B7280';
  }
}
