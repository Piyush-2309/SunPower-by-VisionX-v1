// ============================================
// SunFlow 360 — Lead Management Types
// Strict alignment with backend Java DTOs & Enums
// ============================================

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'DISQUALIFIED'
  | 'CONVERTED';

export type EnquiryChannel =
  | 'WEB_FORM'
  | 'WHATSAPP'
  | 'VOICE';

export type PropertyType =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'INDUSTRIAL'
  | 'INSTITUTIONAL'
  | 'OTHER';

export type SystemType =
  | 'ON_GRID'
  | 'OFF_GRID';

export interface LeadCreateRequest {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  propertyType?: PropertyType;
  requestedCapacityKw?: number;
  systemType?: SystemType;
  monthlyBill?: number;
  roofAreaSqft?: number;
  preferredLanguage?: string;
  subsidyInterest?: boolean;
  channel: EnquiryChannel;
  qualificationNotes?: string;
}

export interface LeadStatusUpdateRequest {
  status: LeadStatus;
}

export interface LeadResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  propertyType: PropertyType;
  requestedCapacityKw: number | null;
  systemType: SystemType | null;
  monthlyBill: number | null;
  roofAreaSqft: number | null;
  preferredLanguage: string | null;
  subsidyInterest: boolean;
  channel: EnquiryChannel;
  status: LeadStatus;
  qualificationNotes: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface GetLeadsParams {
  status?: LeadStatus;
  channel?: EnquiryChannel;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}
