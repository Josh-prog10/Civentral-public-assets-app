import { PARKS, TIME_SLOTS } from '@/src/data/parks';
import type { Reservation as FacilityReservation, ReservationStatus } from '@/src/modules/facility-reservation/types';
import type { RequestFormData, SubmitResult } from '@/src/modules/water-supply-drainage/types';
import type { Reservation as ParkReservation } from '@/src/types/reservation';
import * as FileSystem from 'expo-file-system';
import { File, Paths } from 'expo-file-system';
import * as Location from 'expo-location';

export interface SqlDatabaseState {
  parkFacilities: ParkFacilityRow[];
  lguFacilities: LguFacilityRow[];
  parkReservations: ParkReservationRow[];
  lguReservations: LguReservationRow[];
  wdRequests: WaterRequestRow[];
  wdRequestCategories: WaterCategoryRow[];
}

export interface ParkFacilityRow {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface LguFacilityRow {
  id: number;
  name: string;
  type: 'covered_court' | 'function_hall' | 'barangay_hall' | 'conference_room' | 'auditorium' | 'other';
  description: string | null;
  capacity: number | null;
  location: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ParkReservationRow {
  id: number;
  facility_id: number;
  user_id: number;
  user_name: string;
  event_name: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'approved' | 'cancelled' | 'rejected' | 'completed';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_amount: number;
  payment_method: string | null;
  payment_reference: string | null;
  payment_notes: string | null;
  receipt_number: string | null;
  paid_at: string | null;
  cancelled_reason: 'manual' | 'expired' | null;
  created_at: string;
  updated_at: string;
}

export interface LguReservationRow {
  id: number;
  facility_id: number;
  user_id: number;
  purpose: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_amount: number;
  payment_method: string | null;
  payment_reference: string | null;
  payment_notes: string | null;
  receipt_number: string | null;
  paid_at: string | null;
  cancelled_reason: 'manual' | 'expired' | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  participants?: number;
}

export interface WaterRequestRow {
  id: number;
  category_id: number;
  user_id: number;
  title: string;
  description: string | null;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  photo_uri: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  assigned_to: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export type NewLguFacility = Pick<LguFacilityRow, 'name' | 'type' | 'description' | 'capacity' | 'location'>;

export interface WaterCategoryRow {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const DB_FILE = `${FileSystem.Paths.document.uri}civentral_local_db.json`;

const buildSeedDatabase = (): SqlDatabaseState => ({
  parkFacilities: [
    {
      id: 1,
      name: "Caloocan People's Park",
      description: 'Public park with playground, open spaces, and interactive fountain',
      capacity: 500,
      status: 'active',
      created_at: '2026-09-15 06:44:58',
      updated_at: '2026-09-15 06:44:58',
    },
  ],
  lguFacilities: [
    {
      id: 1,
      name: 'Barangay 176 Covered Court',
      type: 'covered_court',
      description: 'Multipurpose covered court used for sports activities, community programs, and barangay events.',
      capacity: 500,
      location: 'Barangay 176, Bagong Silang, Caloocan City',
      status: 'active',
      created_at: '2026-09-01 13:34:34',
      updated_at: '2026-09-01 13:34:34',
    },
  ],
  parkReservations: [
    {
      id: 1,
      facility_id: 1,
      user_id: 23,
      user_name: 'Renz Dela Cruz',
      event_name: 'Kasalang Bayan',
      description: '',
      start_datetime: '2026-09-15 14:50:00',
      end_datetime: '2026-09-15 14:55:00',
      status: 'completed',
      payment_status: 'paid',
      payment_amount: 1200,
      payment_method: 'cash',
      payment_reference: '',
      payment_notes: null,
      receipt_number: 'PRCPT-20260915-F6AA31',
      paid_at: '2026-09-15 14:48:50',
      cancelled_reason: null,
      created_at: '2026-09-15 06:47:37',
      updated_at: '2026-09-15 12:39:22',
    },
  ],
  lguReservations: [
    {
      id: 1,
      facility_id: 1,
      user_id: 23,
      purpose: 'Birthday',
      description: 'asdsadasdsadadasd',
      start_datetime: '2026-09-15 13:20:00',
      end_datetime: '2026-09-15 13:25:00',
      status: 'completed',
      payment_status: 'paid',
      payment_amount: 1200,
      payment_method: 'cash',
      payment_reference: '',
      payment_notes: null,
      receipt_number: 'RCPT-20260915-C61B65',
      paid_at: '2026-09-15 13:18:28',
      cancelled_reason: null,
      created_at: '2026-09-15 05:16:29',
      updated_at: '2026-09-15 12:41:20',
      user_name: 'Renz Dela Cruz',
    },
    {
      id: 2,
      facility_id: 1,
      user_id: 23,
      purpose: 'Meeting',
      description: '',
      start_datetime: '2026-09-15 13:26:00',
      end_datetime: '2026-09-15 13:30:00',
      status: 'cancelled',
      payment_status: 'unpaid',
      payment_amount: 0,
      payment_method: null,
      payment_reference: null,
      payment_notes: null,
      receipt_number: null,
      paid_at: null,
      cancelled_reason: 'expired',
      created_at: '2026-09-15 05:17:23',
      updated_at: '2026-09-15 12:41:20',
      user_name: 'Renz Dela Cruz',
    },
  ],
  wdRequests: [
    {
      id: 1,
      category_id: 11,
      user_id: 23,
      title: 'adasdasd',
      description: 'asdsadsadasda',
      location_text: '8th Street corner 8th Avenue, South Caloocan City',
      latitude: 14.59878389,
      longitude: 120.98472834,
      photo_uri: null,
      status: 'pending',
      assigned_to: null,
      admin_notes: null,
      created_at: '2026-09-01 13:19:23',
      updated_at: '2026-09-01 13:19:23',
    },
    {
      id: 2,
      category_id: 2,
      user_id: 23,
      title: 'asdasdsadsa',
      description: 'dsadsadsadasd',
      location_text: '8th Street corner 8th Avenue, South Caloocan City',
      latitude: 14.5995,
      longitude: 120.9842,
      photo_uri: null,
      status: 'pending',
      assigned_to: null,
      admin_notes: null,
      created_at: '2026-09-01 13:23:03',
      updated_at: '2026-09-01 13:23:03',
    },
  ],
  wdRequestCategories: [
    { id: 1, name: 'Water Supply Issue', description: 'Problems with water pressure, no water supply, broken pipes, etc.', created_at: '2026-09-01 11:32:57', updated_at: '2026-09-01 11:32:57' },
    { id: 2, name: 'Drainage Clog', description: 'Clogged drains, flooding, sewage backup, etc.', created_at: '2026-09-01 11:32:57', updated_at: '2026-09-01 11:32:57' },
    { id: 3, name: 'Water Quality Concern', description: 'Discolored water, foul odor, or contamination reports.', created_at: '2026-09-01 11:32:57', updated_at: '2026-09-01 11:32:57' },
    { id: 4, name: 'Irrigation System', description: 'Issues with public irrigation or watering systems.', created_at: '2026-09-01 11:32:57', updated_at: '2026-09-01 11:32:57' },
    { id: 5, name: 'Water Leakage', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 6, name: 'Low Water Pressure', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 7, name: 'Water Connection Request', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 8, name: 'Water Connection Repair', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 9, name: 'Drainage Damage', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 10, name: 'Drainage Overflow', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 11, name: 'Flooding / Water Accumulation', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 12, name: 'Sewerage / Wastewater Concern', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 13, name: 'Drainage Maintenance', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 14, name: 'Water Infrastructure Damage', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 15, name: 'Other Water/Drainage Concern', description: '', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 16, name: 'Drainage Problem', description: 'Drainage system problems and maintenance requests.', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
    { id: 17, name: 'Blocked Drainage', description: 'Blocked or clogged drainage reports.', created_at: '2026-09-01 13:06:38', updated_at: '2026-09-01 13:06:38' },
  ],
});

const ensureDatabase = async (): Promise<SqlDatabaseState> => {
  try {
    const existing = await FileSystem.readAsStringAsync(DB_FILE);
    const parsed = JSON.parse(existing) as SqlDatabaseState;
    if (parsed && parsed.parkFacilities && parsed.lguFacilities && parsed.wdRequestCategories) {
      const seeded = buildSeedDatabase();
      const knownCategories = new Set(parsed.wdRequestCategories.map((category) => category.name));
      parsed.wdRequestCategories = [
        ...parsed.wdRequestCategories,
        ...seeded.wdRequestCategories.filter((category) => !knownCategories.has(category.name)),
      ];
      parsed.wdRequests = (parsed.wdRequests ?? []).map((request) => ({
        ...request,
        photo_uri: request.photo_uri ?? null,
        admin_notes: request.admin_notes ?? null,
      }));
      parsed.lguReservations = parsed.lguReservations ?? [];
      parsed.lguFacilities = parsed.lguFacilities ?? seeded.lguFacilities;
      return parsed;
    }
  } catch {
    // fall through to seed.
  }

  const seeded = buildSeedDatabase();
  await FileSystem.writeAsStringAsync(DB_FILE, JSON.stringify(seeded, null, 2));
  return seeded;
};

const persistDatabase = async (db: SqlDatabaseState): Promise<SqlDatabaseState> => {
  await FileSystem.writeAsStringAsync(DB_FILE, JSON.stringify(db, null, 2));
  return db;
};

const reservationStatusMap: Record<string, ReservationStatus> = {
  pending: 'Pending',
  approved: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Cancelled',
};

export async function getParkFacilities(): Promise<ParkFacilityRow[]> {
  const db = await ensureDatabase();
  return db.parkFacilities;
}

export async function getLguFacilities(): Promise<LguFacilityRow[]> {
  const db = await ensureDatabase();
  return db.lguFacilities.filter((facility) => facility.status === 'active');
}

export async function addLguFacility(facility: NewLguFacility): Promise<LguFacilityRow> {
  const db = await ensureDatabase();
  const duplicate = db.lguFacilities.some(
    (item) => item.status === 'active' && item.name.trim().toLowerCase() === facility.name.trim().toLowerCase()
  );
  if (duplicate) {
    throw new Error('A facility with this name already exists.');
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const created: LguFacilityRow = {
    id: Math.max(0, ...db.lguFacilities.map((item) => item.id)) + 1,
    ...facility,
    name: facility.name.trim(),
    location: facility.location.trim(),
    description: facility.description?.trim() || null,
    status: 'active',
    created_at: now,
    updated_at: now,
  };

  db.lguFacilities = [...db.lguFacilities, created];
  await persistDatabase(db);
  return created;
}

export async function getFacilityReservations(): Promise<FacilityReservation[]> {
  const db = await ensureDatabase();
  const rows = db.lguReservations; 

  return rows.map((reservation) => {
    const facility = db.lguFacilities.find((item) => item.id === reservation.facility_id);
    return {
      id: String(reservation.id),
      referenceNumber: reservation.receipt_number ?? `FAC-${reservation.id}`,
      facilityId: String(reservation.facility_id),
      facilityName: facility?.name ?? 'Unknown Facility',
      date: reservation.start_datetime.slice(0, 10),
      startTime: reservation.start_datetime.slice(11, 16),
      endTime: reservation.end_datetime.slice(11, 16),
      purpose: reservation.purpose,
      participants: reservation.participants ?? 20,
      notes: reservation.description ?? '',
      status: reservationStatusMap[reservation.status] ?? 'Pending',
      createdAt: reservation.created_at,
    };
  });
}

export async function getParkReservations(): Promise<ParkReservation[]> {
  const db = await ensureDatabase();

  return db.parkReservations.map((reservation) => {
    const park = PARKS[(reservation.facility_id - 1)] ?? PARKS[0];
    const start = reservation.start_datetime.slice(11, 16);
    const slot = TIME_SLOTS.find((item) => item.startTime === start) ?? TIME_SLOTS[0];

    return {
      id: String(reservation.id),
      parkId: park?.id ?? 'park-001',
      parkName: park?.name ?? 'Unknown Park',
      date: reservation.start_datetime.slice(0, 10),
      slotId: slot?.id ?? 'slot-1',
      startTime: start,
      endTime: reservation.end_datetime.slice(11, 16),
      purpose: reservation.event_name,
      status: reservation.status === 'approved' ? 'Approved' : reservation.status === 'cancelled' ? 'Cancelled' : reservation.status === 'rejected' ? 'Rejected' : reservation.status === 'completed' ? 'Completed' : 'Pending',
      createdAt: reservation.created_at,
      userId: String(reservation.user_id),
    };
  });
}

export async function saveFacilityReservations(reservations: FacilityReservation[]): Promise<FacilityReservation[]> {
  const db = await ensureDatabase();
  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const mapped = reservations.map((reservation) => ({
    id: Number(reservation.id),
    facility_id: Number(reservation.facilityId),
    user_id: 23,
    purpose: reservation.purpose,
    description: reservation.notes,
    start_datetime: `${reservation.date} ${reservation.startTime}:00`,
    end_datetime: `${reservation.date} ${reservation.endTime}:00`,
    status: reservation.status === 'Confirmed' ? 'approved' : reservation.status === 'Completed' ? 'completed' : reservation.status === 'Cancelled' ? 'cancelled' : 'pending',
    payment_status: 'unpaid',
    payment_amount: 0,
    payment_method: null,
    payment_reference: null,
    payment_notes: null,
    receipt_number: reservation.referenceNumber || `FAC-${Date.now()}`,
    paid_at: null,
    cancelled_reason: null,
    created_at: reservation.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
    updated_at: updatedAt,
    user_name: 'App User',
    participants: reservation.participants,
  } as LguReservationRow));

  db.lguReservations = mapped;
  await persistDatabase(db);
  return reservations;
}

export async function saveParkReservations(reservations: ParkReservation[]): Promise<ParkReservation[]> {
  const db = await ensureDatabase();

  const mapped = reservations.map((reservation) => {
    const parkIndex = PARKS.findIndex((park) => park.id === reservation.parkId);
    const facilityId = parkIndex >= 0 ? parkIndex + 1 : 1;
    const startDate = `${reservation.date} ${reservation.startTime}:00`;
    const endDate = `${reservation.date} ${reservation.endTime}:00`;

    return {
      id: Number(reservation.id),
      facility_id: facilityId,
      user_id: Number(reservation.userId) || 23,
      user_name: 'App User',
      event_name: reservation.purpose,
      description: '',
      start_datetime: startDate,
      end_datetime: endDate,
      status: reservation.status === 'Approved' ? 'approved' : reservation.status === 'Cancelled' ? 'cancelled' : reservation.status === 'Rejected' ? 'rejected' : reservation.status === 'Completed' ? 'completed' : 'pending',
      payment_status: 'unpaid',
      payment_amount: 0,
      payment_method: null,
      payment_reference: null,
      payment_notes: null,
      receipt_number: `PR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      paid_at: null,
      cancelled_reason: reservation.status === 'Cancelled' ? 'manual' : null,
      created_at: reservation.createdAt || new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    } as ParkReservationRow;
  });

  db.parkReservations = mapped;
  await persistDatabase(db);
  return reservations;
}

export async function getWaterRequestCategories(): Promise<string[]> {
  const db = await ensureDatabase();
  return db.wdRequestCategories.map((category) => category.name);
}

export async function submitWaterRequestToSql(data: RequestFormData): Promise<SubmitResult> {
  const db = await ensureDatabase();
  if (!data.place.trim() || !data.description.trim()) {
    return {
      success: false,
      message: 'Enter the incident place and describe the issue before submitting.',
    };
  }

  if (data.latitude == null || data.longitude == null) {
    return {
      success: false,
      message: 'Current location permission is required before submitting. Please allow access to your device location.',
    };
  }

  if (
    !Number.isFinite(data.latitude) ||
    !Number.isFinite(data.longitude) ||
    data.latitude < -90 || data.latitude > 90 ||
    data.longitude < -180 || data.longitude > 180
  ) {
    return { success: false, message: 'The selected location coordinates are invalid.' };
  }

  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: data.latitude,
      longitude: data.longitude,
    });
    const address = addresses[0];
    const addressText = address
      ? [address.city, address.district, address.subregion, address.region, address.formattedAddress]
          .filter(Boolean)
          .join(' ')
      : '';
    if (!/\bcaloocan\b/i.test(addressText)) {
      return {
        success: false,
        message: 'Please select a location within North or South Caloocan.',
      };
    }
  } catch {
    return {
      success: false,
      message: 'Unable to verify that location is within Caloocan. Please select or use a location again.',
    };
  }

  if (!data.photoUri) {
    return {
      success: false,
      message: 'A photo is required before submission. Please take a photo of the issue and try again.',
    };
  }

  const category = db.wdRequestCategories.find((item) => item.name === 'Other Water/Drainage Concern') ?? db.wdRequestCategories[0];
  if (!category) {
    return { success: false, message: 'Request categories are unavailable. Please contact support.' };
  }
  const id = Math.max(0, ...db.wdRequests.map((request) => request.id)) + 1;
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

  const requestId = `WSDR-${String(id).padStart(6, '0')}`;
  const photoFile = new File(data.photoUri);
  const storedPhoto = new File(Paths.document, `${requestId}.jpg`);
  photoFile.copy(storedPhoto);

  const record: WaterRequestRow = {
    id,
    category_id: category.id,
    user_id: 23,
    title: data.place.trim(),
    description: data.description,
    location_text: data.place.trim(),
    latitude: data.latitude,
    longitude: data.longitude,
    photo_uri: storedPhoto.uri,
    status: 'pending',
    assigned_to: null,
    admin_notes: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  db.wdRequests = [...db.wdRequests, record];
  await persistDatabase(db);

  return {
    success: true,
    message: 'Request submitted successfully. We will attend to it shortly.',
    referenceId: requestId,
    request: {
      id: String(id),
      referenceId: requestId,
      place: data.place.trim(),
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      photoUri: storedPhoto.uri,
      status: 'Pending',
      submittedAt: timestamp,
      staffRemarks: null,
    },
  };
}

export async function getWaterRequestRecords(): Promise<WaterRequestRow[]> {
  const db = await ensureDatabase();
  return db.wdRequests.map((request) => {
    const category = db.wdRequestCategories.find((item) => item.id === request.category_id);
    return {
      ...request,
      category_name: category?.name ?? 'Water Supply Issue',
      reference_id: `WSDR-${String(request.id).padStart(6, '0')}`,
      status: request.status ?? 'pending',
    } as WaterRequestRow & { category_name: string; reference_id: string };
  });
}

export async function getSqlDatabase(): Promise<SqlDatabaseState> {
  return ensureDatabase();
}
