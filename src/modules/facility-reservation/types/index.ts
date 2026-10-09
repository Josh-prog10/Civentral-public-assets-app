export type ReservationStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export type Tab = 'list' | 'new';

export interface Facility {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  imageColor: string;
}

export interface Reservation {
  id: string;
  referenceNumber: string;
  facilityId: string;
  facilityName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  participants: number;
  notes: string;
  status: ReservationStatus;
  createdAt: string;
}