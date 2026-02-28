// ─── Domain types ─────────────────────────────────────────────────────────────

export interface TimesheetEntry {
  id: string;
  title: string;
  /** "HH:MM" 24-hour format */
  from: string;
  /** "HH:MM" 24-hour format */
  to: string;
  /** Index into COLORS array (0-9) */
  color: number;
  notes: string;
}

/** Entries for a single calendar day */
export interface DaySheet {
  userId: string;
  /** "YYYY-MM-DD" */
  date: string;
  entries: TimesheetEntry[];
  updatedAt: string; // ISO timestamp
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── API request / response shapes ───────────────────────────────────────────

export interface GetDaySheetResponse {
  sheet: DaySheet | null;
}

export interface UpsertDaySheetRequest {
  entries: TimesheetEntry[];
}

export interface UpsertDaySheetResponse {
  sheet: DaySheet;
}

export interface CopyToNextDayRequest {
  fromDate: string; // "YYYY-MM-DD"
}

export interface CopyToNextDayResponse {
  sheet: DaySheet;
}

// ─── API error ────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export type MobileTab = 'timeline' | 'entries';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/** Used in the entry form modal */
export type EntryFormValues = Omit<TimesheetEntry, 'id'> & { id?: string };
