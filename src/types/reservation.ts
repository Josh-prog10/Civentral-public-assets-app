export type ReservationStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled';

export interface Park {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  amenities: string[];
  imageUrl?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
}

export interface Reservation {
  id: string;
  parkId: string;
  parkName: string;
  date: string;        // YYYY-MM-DD
  slotId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: ReservationStatus;
  createdAt: string;
  userId: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
}

export interface ReservationFormData {
  parkId: string;
  date: string;
  slotId: string;
  purpose: string;
}