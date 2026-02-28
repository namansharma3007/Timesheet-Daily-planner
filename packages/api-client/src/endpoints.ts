import type {
  AuthResponse,
  CopyToNextDayResponse,
  GetDaySheetResponse,
  LoginRequest,
  RegisterRequest,
  UpsertDaySheetRequest,
  UpsertDaySheetResponse,
} from '@timesheet/types';
import { http } from './http';

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login(data: LoginRequest, signal?: AbortSignal): Promise<AuthResponse> {
    return http.post<AuthResponse>('/api/auth/login', data, signal);
  },

  register(data: RegisterRequest, signal?: AbortSignal): Promise<AuthResponse> {
    return http.post<AuthResponse>('/api/auth/register', data, signal);
  },

  /** Verify the stored token and get current user (called on app boot) */
  me(signal?: AbortSignal): Promise<AuthResponse> {
    return http.get<AuthResponse>('/api/auth/me', signal);
  },
};

// ─── Timesheet API ────────────────────────────────────────────────────────────

export const timesheetApi = {
  /**
   * GET /api/timesheets/:date
   * Returns null sheet if no entries exist for that date yet.
   */
  getDay(date: string, signal?: AbortSignal): Promise<GetDaySheetResponse> {
    return http.get<GetDaySheetResponse>(`/api/timesheets/${date}`, signal);
  },

  /**
   * PUT /api/timesheets/:date
   * Full replace of entries for the given date.
   */
  upsertDay(
    date: string,
    data: UpsertDaySheetRequest,
    signal?: AbortSignal,
  ): Promise<UpsertDaySheetResponse> {
    return http.put<UpsertDaySheetResponse>(`/api/timesheets/${date}`, data, signal);
  },

  /**
   * POST /api/timesheets/:date/copy-next
   * Duplicates the given day's entries to the next calendar day.
   */
  copyToNextDay(date: string, signal?: AbortSignal): Promise<CopyToNextDayResponse> {
    return http.post<CopyToNextDayResponse>(`/api/timesheets/${date}/copy-next`, {}, signal);
  },
};
