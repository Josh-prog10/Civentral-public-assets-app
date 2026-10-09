export type Category =
  | 'Water Supply Issue'
  | 'Water Leakage'
  | 'Drainage Problem'
  | 'Flooding'
  | 'Blocked Drainage'
  | 'Other';

export interface RequestFormData {
  place: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  photoUri: string | null;
  photoFileName?: string | null;
  photo: File | null;
  staffRemarks?: string | null;
}

export type FormErrors = Partial<Record<keyof RequestFormData, string>>;

export interface SubmitResult {
  success: boolean;
  message: string;
  referenceId?: string;
  request?: {
    id: string;
    referenceId: string;
    place: string;
    description: string;
    latitude: number | null;
    longitude: number | null;
    photoUri: string | null;
    status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected' | 'Closed';
    submittedAt: string;
    staffRemarks?: string | null;
  };
}