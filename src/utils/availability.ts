import { Reservation, TimeSlot } from '../types/reservation';

/**
 * Checks if a given (parkId, date, slotId) is already reserved.
 * Only 'Pending' and 'Approved' reservations block a slot.
 */
export function isSlotTaken(
  reservations: Reservation[],
  parkId: string,
  date: string,
  slotId: string,
  excludeReservationId?: string
): boolean {
  return reservations.some(
    (r) =>
      r.parkId === parkId &&
      r.date === date &&
      r.slotId === slotId &&
      r.id !== excludeReservationId &&
      (r.status === 'Pending' || r.status === 'Approved')
  );
}

export function getAvailableSlots(
  reservations: Reservation[],
  allSlots: TimeSlot[],
  parkId: string,
  date: string,
  excludeReservationId?: string
): TimeSlot[] {
  return allSlots.filter(
    (slot) => !isSlotTaken(reservations, parkId, date, slot.id, excludeReservationId)
  );
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}