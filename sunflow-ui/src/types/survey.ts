// ============================================
// SunFlow 360 — Site Survey Types
// Strict alignment with backend Java DTOs & Enums
// ============================================

import type { SpringPage } from './lead';

export type SurveyStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export type RoofType =
  | 'RCC_FLAT'
  | 'PITCHED_TILED'
  | 'METAL_SHEET'
  | 'GROUND_MOUNT'
  | 'OTHER';

export type ShadingCondition =
  | 'NO_SHADING'
  | 'PARTIAL_SHADING'
  | 'HEAVY_SHADING';

export type ElectricalConnection =
  | 'SINGLE_PHASE'
  | 'THREE_PHASE';

export type SurveyFeasibility =
  | 'FEASIBLE'
  | 'FEASIBLE_WITH_CONDITIONS'
  | 'NOT_FEASIBLE';

export interface SurveyCreateRequest {
  leadId: string;
  surveyorName: string;
  surveyorPhone?: string;
  scheduledAt: string;
  siteAddress?: string;
  notes?: string;
}

export interface SurveyAssessmentUpdateRequest {
  roofType?: RoofType;
  usableRoofAreaSqft?: number;
  shadingCondition?: ShadingCondition;
  electricalConnection?: ElectricalConnection;
  sanctionedLoadKw?: number;
  recommendedCapacityKw?: number;
  feasibility?: SurveyFeasibility;
  assessmentNotes?: string;
  completeSurvey?: boolean;
}

export interface SurveyStatusUpdateRequest {
  status: SurveyStatus;
}

export interface SurveyResponse {
  id: string;
  leadId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  surveyorName: string;
  surveyorPhone: string | null;
  scheduledAt: string;
  completedAt: string | null;
  siteAddress: string | null;
  status: SurveyStatus;
  roofType: RoofType | null;
  usableRoofAreaSqft: number | null;
  shadingCondition: ShadingCondition | null;
  electricalConnection: ElectricalConnection | null;
  sanctionedLoadKw: number | null;
  recommendedCapacityKw: number | null;
  feasibility: SurveyFeasibility | null;
  assessmentNotes: string | null;
  schedulingNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSurveysParams {
  status?: SurveyStatus;
  surveyor?: string;
  leadId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export type { SpringPage };
