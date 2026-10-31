import axios, { AxiosError } from 'axios';
import type {
  LeadCreateRequest,
  LeadResponse,
  LeadStatus,
  LeadStatusUpdateRequest,
  GetLeadsParams,
  SpringPage,
} from '../types/lead';
import type {
  SurveyCreateRequest,
  SurveyAssessmentUpdateRequest,
  SurveyStatusUpdateRequest,
  SurveyResponse,
  SurveyStatus,
  GetSurveysParams,
} from '../types/survey';

// Base URL: Read from VITE_API_BASE_URL, default to http://localhost:8080 for development
const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: configuredBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios response interceptor for CORS / network fallback
// When running in Vite dev server (port 5173), direct requests to localhost:8080
// may get blocked by browser CORS policy if Spring Boot has no @CrossOrigin.
// This interceptor retries through Vite's local reverse proxy (/api) seamlessly.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    // Check if error is network/CORS failure and we haven't retried yet
    if (
      config &&
      !config.headers['X-Proxy-Retry'] &&
      (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.response?.status === 403)
    ) {
      if (typeof window !== 'undefined' && config.baseURL !== '') {
        config.headers['X-Proxy-Retry'] = 'true';
        config.baseURL = ''; // Use same-origin Vite proxy
        return api(config);
      }
    }
    return Promise.reject(error);
  }
);

export interface HealthResponse {
  application: string;
  status: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>('/api/health');
  return response.data;
}

/**
 * Create a new lead from enquiry submission.
 * Backend endpoint: POST /api/leads
 */
export async function createLead(request: LeadCreateRequest): Promise<LeadResponse> {
  const response = await api.post<LeadResponse>('/api/leads', request);
  return response.data;
}

/**
 * Fetch paginated leads with optional search, status, and channel filters.
 * Backend endpoint: GET /api/leads
 */
export async function getLeads(params?: GetLeadsParams): Promise<SpringPage<LeadResponse>> {
  const response = await api.get<SpringPage<LeadResponse>>('/api/leads', {
    params: {
      status: params?.status || undefined,
      channel: params?.channel || undefined,
      search: params?.search ? params.search.trim() : undefined,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort || 'createdAt,desc',
    },
  });
  return response.data;
}

/**
 * Fetch a single lead by UUID.
 * Backend endpoint: GET /api/leads/{id}
 */
export async function getLeadById(id: string): Promise<LeadResponse> {
  const response = await api.get<LeadResponse>(`/api/leads/${id}`);
  return response.data;
}

/**
 * Update lead status.
 * Backend endpoint: PATCH /api/leads/{id}/status
 */
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadResponse> {
  const payload: LeadStatusUpdateRequest = { status };
  const response = await api.patch<LeadResponse>(`/api/leads/${id}/status`, payload);
  return response.data;
}

// ============================================
// Site Survey API Endpoints
// ============================================

/**
 * Schedule a new site survey for a customer lead.
 * Backend endpoint: POST /api/surveys
 */
export async function createSurvey(request: SurveyCreateRequest): Promise<SurveyResponse> {
  const response = await api.post<SurveyResponse>('/api/surveys', request);
  return response.data;
}

/**
 * Fetch paginated surveys with optional status, surveyor, and leadId filters.
 * Backend endpoint: GET /api/surveys
 */
export async function getSurveys(params?: GetSurveysParams): Promise<SpringPage<SurveyResponse>> {
  const response = await api.get<SpringPage<SurveyResponse>>('/api/surveys', {
    params: {
      status: params?.status || undefined,
      surveyor: params?.surveyor ? params.surveyor.trim() : undefined,
      leadId: params?.leadId || undefined,
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      sort: params?.sort || 'scheduledAt,asc',
    },
  });
  return response.data;
}

/**
 * Fetch survey details by UUID.
 * Backend endpoint: GET /api/surveys/{id}
 */
export async function getSurveyById(id: string): Promise<SurveyResponse> {
  const response = await api.get<SurveyResponse>(`/api/surveys/${encodeURIComponent(id)}`);
  return response.data;
}

/**
 * Update technical survey assessment findings.
 * Backend endpoint: PUT /api/surveys/{id}/assessment
 */
export async function updateSurveyAssessment(
  id: string,
  request: SurveyAssessmentUpdateRequest
): Promise<SurveyResponse> {
  const response = await api.put<SurveyResponse>(
    `/api/surveys/${encodeURIComponent(id)}/assessment`,
    request
  );
  return response.data;
}

/**
 * Update survey status with state transition validation.
 * Backend endpoint: PATCH /api/surveys/{id}/status
 */
export async function updateSurveyStatus(
  id: string,
  status: SurveyStatus
): Promise<SurveyResponse> {
  const payload: SurveyStatusUpdateRequest = { status };
  const response = await api.patch<SurveyResponse>(
    `/api/surveys/${encodeURIComponent(id)}/status`,
    payload
  );
  return response.data;
}

/**
 * Get all surveys associated with a specific customer lead.
 * Backend endpoint: GET /api/leads/{leadId}/surveys
 */
export async function getSurveysByLeadId(leadId: string): Promise<SurveyResponse[]> {
  const response = await api.get<SurveyResponse[]>(
    `/api/leads/${encodeURIComponent(leadId)}/surveys`
  );
  return response.data;
}

export default api;

