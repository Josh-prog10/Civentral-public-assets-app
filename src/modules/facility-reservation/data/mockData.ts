import type { Facility, Reservation } from '../types';

export const FACILITIES: Facility[] = [
  { id: 'f1', name: 'Community Hall A', type: 'Hall', capacity: 200, location: 'Building 1, Ground Floor', imageColor: '#4F46E5' },
  { id: 'f2', name: 'Conference Room B', type: 'Meeting Room', capacity: 30, location: 'Building 2, 3rd Floor', imageColor: '#0891B2' },
  { id: 'f3', name: 'Sports Court', type: 'Sports', capacity: 50, location: 'Outdoor Area', imageColor: '#16A34A' },
  { id: 'f4', name: 'Multimedia Studio', type: 'Studio', capacity: 15, location: 'Building 3, 2nd Floor', imageColor: '#D97706' },
  { id: 'f5', name: 'Training Room C', type: 'Training', capacity: 40, location: 'Building 1, 4th Floor', imageColor: '#DC2626' },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    referenceNumber: 'FRS-2024-0001',
    facilityId: 'f1',
    facilityName: 'Community Hall A',
    date: '2025-06-15',
    startTime: '09:00',
    endTime: '12:00',
    purpose: 'Town Hall Meeting',
    participants: 150,
    notes: 'Need projector and microphone setup.',
    status: 'Confirmed',
    createdAt: '2025-05-01T10:00:00Z',
  },
  {
    id: 'r2',
    referenceNumber: 'FRS-2024-0002',
    facilityId: 'f2',
    facilityName: 'Conference Room B',
    date: '2025-06-20',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Department Budget Review',
    participants: 12,
    notes: 'Video conferencing required.',
    status: 'Pending',
    createdAt: '2025-05-10T14:30:00Z',
  },
  {
    id: 'r3',
    referenceNumber: 'FRS-2024-0003',
    facilityId: 'f3',
    facilityName: 'Sports Court',
    date: '2025-06-10',
    startTime: '08:00',
    endTime: '10:00',
    purpose: 'Basketball Practice',
    participants: 20,
    notes: '',
    status: 'Completed',
    createdAt: '2025-04-20T09:15:00Z',
  },
];