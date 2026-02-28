import { Router } from 'express';
import { z } from 'zod';
import { DaySheetModel } from '../models/DaySheet';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { ApiErrors, sendSuccess } from '../utils/response';
import { genId, offsetDate, toDateKey } from '@timesheet/utils';
import type {
  CopyToNextDayResponse,
  GetDaySheetResponse,
  UpsertDaySheetResponse,
} from '@timesheet/types';

const router = Router();

// All timesheet routes require auth
router.use(requireAuth);

const entrySchema = z.object({
  id: z.string().min(1).max(36),
  title: z.string().min(1).max(200),
  from: z.string().regex(/^\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}$/),
  color: z.number().int().min(0).max(9),
  notes: z.string().max(1000).default(''),
});

const upsertSchema = z.object({
  entries: z.array(entrySchema).max(100),
});

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

// GET /api/timesheets/:date
router.get('/:date', async (req, res) => {
  const { date } = req.params as { date: string };
  if (!validateDate(date)) {
    ApiErrors.badRequest(res, 'Invalid date format. Use YYYY-MM-DD');
    return;
  }

  const { userId } = req as AuthRequest;
  const sheet = await DaySheetModel.findOne({ userId, date }).lean();

  if (!sheet) {
    sendSuccess<GetDaySheetResponse>(res, { sheet: null });
    return;
  }

  sendSuccess<GetDaySheetResponse>(res, {
    sheet: {
      userId,
      date: sheet.date,
      entries: sheet.entries,
      updatedAt: (sheet as { updatedAt?: Date }).updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  });
});

// PUT /api/timesheets/:date
router.put('/:date', async (req, res) => {
  const { date } = req.params as { date: string };
  if (!validateDate(date)) {
    ApiErrors.badRequest(res, 'Invalid date format. Use YYYY-MM-DD');
    return;
  }

  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    ApiErrors.badRequest(res, parsed.error.issues[0]?.message ?? 'Invalid input');
    return;
  }

  const { userId } = req as AuthRequest;
  const { entries } = parsed.data;

  const sheet = await DaySheetModel.findOneAndUpdate(
    { userId, date },
    { $set: { entries, updatedAt: new Date() } },
    { upsert: true, new: true, lean: true },
  );

  sendSuccess<UpsertDaySheetResponse>(res, {
    sheet: {
      userId,
      date: sheet.date,
      entries: sheet.entries,
      updatedAt: (sheet as { updatedAt?: Date }).updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  });
});

// POST /api/timesheets/:date/copy-next
router.post('/:date/copy-next', async (req, res) => {
  const { date } = req.params as { date: string };
  if (!validateDate(date)) {
    ApiErrors.badRequest(res, 'Invalid date format. Use YYYY-MM-DD');
    return;
  }

  const { userId } = req as AuthRequest;
  const source = await DaySheetModel.findOne({ userId, date }).lean();

  if (!source || source.entries.length === 0) {
    ApiErrors.notFound(res, 'No entries found for this date');
    return;
  }

  const nextDate = toDateKey(offsetDate(new Date(date), 1));
  const newEntries = source.entries.map((e) => ({ ...e, id: genId() }));

  const sheet = await DaySheetModel.findOneAndUpdate(
    { userId, date: nextDate },
    { $set: { entries: newEntries, updatedAt: new Date() } },
    { upsert: true, new: true, lean: true },
  );

  sendSuccess<CopyToNextDayResponse>(res, {
    sheet: {
      userId,
      date: sheet.date,
      entries: sheet.entries,
      updatedAt: (sheet as { updatedAt?: Date }).updatedAt?.toISOString() ?? new Date().toISOString(),
    },
  });
});

export default router;
