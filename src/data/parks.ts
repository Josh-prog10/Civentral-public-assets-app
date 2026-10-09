import { Park, TimeSlot } from '../types/reservation';

export const PARKS: Park[] = [
  {
    id: 'park-001',
    name: 'Sunset Community Park',
    description: 'A spacious park with picnic areas and sports courts.',
    address: '123 Sunset Blvd, Springfield',
    capacity: 150,
    amenities: ['Picnic Tables', 'Basketball Court', 'Restrooms', 'Parking'],
  },
  {
    id: 'park-002',
    name: 'Riverside Recreation Center',
    description: 'Indoor/outdoor facility perfect for events and gatherings.',
    address: '456 River Rd, Springfield',
    capacity: 200,
    amenities: ['Indoor Hall', 'Kitchen', 'Stage', 'Air Conditioning'],
  },
  {
    id: 'park-003',
    name: 'Greenfield Sports Complex',
    description: 'Athletic fields and open green space for team activities.',
    address: '789 Greenfield Ave, Springfield',
    capacity: 300,
    amenities: ['Soccer Field', 'Baseball Diamond', 'Bleachers', 'Concessions'],
  },
  {
    id: 'park-004',
    name: 'Maple Grove Pavilion',
    description: 'Covered pavilion ideal for family reunions and small events.',
    address: '321 Maple St, Springfield',
    capacity: 80,
    amenities: ['Covered Area', 'BBQ Grills', 'Restrooms'],
  },
];

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot-1', startTime: '08:00', endTime: '10:00' },
  { id: 'slot-2', startTime: '10:00', endTime: '12:00' },
  { id: 'slot-3', startTime: '12:00', endTime: '14:00' },
  { id: 'slot-4', startTime: '14:00', endTime: '16:00' },
  { id: 'slot-5', startTime: '16:00', endTime: '18:00' },
  { id: 'slot-6', startTime: '18:00', endTime: '20:00' },
];

// Seed reservations for demo (used to demonstrate conflict detection)
export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: 'res-seed-1',
    parkId: 'park-001',
    parkName: 'Sunset Community Park',
    date: new Date().toISOString().split('T')[0],
    slotId: 'slot-2',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Community Yoga',
    status: 'Approved',
    createdAt: new Date().toISOString(),
    userId: 'user-1',
  },
];

// Import type locally to avoid circular ref issue
import { Reservation } from '../types/reservation';

