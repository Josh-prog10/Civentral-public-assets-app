import { EMPLOYEE_API_BASE_URL, SYSTEM_API_BASE_URL } from './auth-service';

export class CivicApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'CivicApiError';
  }
}

export interface ApiRecord {
  id: number;
  [key: string]: unknown;
}

export interface WaterCategoryRecord extends ApiRecord {
  name: string;
  description: string | null;
}

export interface WaterAttachmentRecord extends ApiRecord {
  original_name: string;
  mime_type: string;
  url: string;
}

export interface WaterRequestRecord extends ApiRecord {
  category_id: number;
  category_name: string;
  title: string;
  description: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
  attachments: WaterAttachmentRecord[];
}

export interface LguFacilityRecord extends ApiRecord {
  name: string;
  type: string;
  description: string | null;
  capacity: number;
  location: string;
  status: 'active' | 'inactive';
}

export interface LguReservationRecord extends ApiRecord {
  facility_id: number;
  facility_name: string;
  user_id: number;
  user_name: string;
  purpose: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  receipt_number: string | null;
  created_at: string;
}

export interface LguFacilitiesResponse {
  items: LguFacilityRecord[];
  canManage: boolean;
}

export interface LguReservationsResponse {
  items: LguReservationRecord[];
  canManage: boolean;
}

export interface EmployeeWaterRequestsResponse {
  items: WaterRequestRecord[];
  canManage: boolean;
  staff: Array<{ id: number; full_name: string }>;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let result: any;
  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    throw new CivicApiError('The server returned an invalid response.', response.status || 502);
  }

  if (!response.ok || result?.status === 'error') {
    throw new CivicApiError(result?.message || `Request failed (${response.status}).`, response.status);
  }
  return result?.data as T;
}

async function request<T>(baseUrl: string, path: string, init: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });
    return await parseResponse<T>(response);
  } catch (error) {
    if (error instanceof CivicApiError) throw error;
    throw new CivicApiError('Could not connect to the CIVentral system. Check the API URL and network, then try again.', 0);
  }
}

const citizenRequestsPath = 'mobile-water-requests.php';
const employeeWaterRequestsPath = 'mobile-water-requests.php';
const employeeReservationsPath = 'mobile-lgu-reservations.php';

export function getWaterRequestCategories(): Promise<WaterCategoryRecord[]> {
  return request(SYSTEM_API_BASE_URL + '/citizen', `${citizenRequestsPath}?view=categories`);
}

export function getMyWaterRequests(): Promise<WaterRequestRecord[]> {
  return request(SYSTEM_API_BASE_URL + '/citizen', citizenRequestsPath);
}

export function submitWaterRequest(data: {
  categoryId: number;
  description: string;
  place: string;
  latitude: number;
  longitude: number;
  photoUri: string;
  photoFileName: string;
}): Promise<WaterRequestRecord> {
  const form = new FormData();
  form.append('category_id', String(data.categoryId));
  form.append('description', data.description);
  form.append('location_text', data.place);
  form.append('latitude', String(data.latitude));
  form.append('longitude', String(data.longitude));
  form.append('photo', {
    uri: data.photoUri,
    name: data.photoFileName || 'water-drainage-photo.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  return request(SYSTEM_API_BASE_URL + '/citizen', citizenRequestsPath, { method: 'POST', body: form });
}

export function getEmployeeWaterRequests(filters: { status?: string; category_id?: number } = {}): Promise<EmployeeWaterRequestsResponse> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.category_id) query.set('category_id', String(filters.category_id));
  const suffix = query.size ? `?${query.toString()}` : '';
  return request(EMPLOYEE_API_BASE_URL, `${employeeWaterRequestsPath}${suffix}`);
}

export function updateEmployeeWaterRequest(
  id: number,
  action: 'status' | 'assign' | 'note',
  values: { status?: string; assigned_to?: number | null; note?: string }
): Promise<WaterRequestRecord> {
  return request(EMPLOYEE_API_BASE_URL, `${employeeWaterRequestsPath}?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ action, ...values }),
  });
}

export function deleteEmployeeWaterRequest(id: number): Promise<void> {
  return request(EMPLOYEE_API_BASE_URL, `${employeeWaterRequestsPath}?id=${id}`, { method: 'DELETE' });
}

export function getLguFacilities(): Promise<LguFacilitiesResponse> {
  return request(EMPLOYEE_API_BASE_URL, `${employeeReservationsPath}?resource=facilities`);
}

export function getLguReservations(filters: { status?: string; facility_id?: number } = {}): Promise<LguReservationsResponse> {
  const query = new URLSearchParams();
  if (filters.status) query.set('status', filters.status);
  if (filters.facility_id) query.set('facility_id', String(filters.facility_id));
  const suffix = query.size ? `?${query.toString()}` : '';
  return request(EMPLOYEE_API_BASE_URL, `${employeeReservationsPath}${suffix}`);
}

export function checkLguReservationAvailability(data: {
  facility_id: number;
  start_datetime: string;
  end_datetime: string;
}): Promise<{ available: boolean }> {
  const query = new URLSearchParams({
    resource: 'availability',
    facility_id: String(data.facility_id),
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime,
  });
  return request(EMPLOYEE_API_BASE_URL, `${employeeReservationsPath}?${query.toString()}`);
}

export function createLguReservation(data: {
  facility_id: number;
  purpose: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
}): Promise<LguReservationRecord> {
  return request(EMPLOYEE_API_BASE_URL, employeeReservationsPath, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateLguReservationStatus(id: number, status: LguReservationRecord['status']): Promise<LguReservationRecord> {
  return request(EMPLOYEE_API_BASE_URL, `${employeeReservationsPath}?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteLguReservation(id: number): Promise<void> {
  return request(EMPLOYEE_API_BASE_URL, `${employeeReservationsPath}?id=${id}`, { method: 'DELETE' });
}
