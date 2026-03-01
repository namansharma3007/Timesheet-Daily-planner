import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { DaySheetModel } from '../models/DaySheet';
import { signToken } from '../utils/jwt';
import { ApiErrors, sendSuccess } from '../utils/response';
import { requireAuth, type AuthRequest } from '../middleware/auth';
import { todayKey, genId } from '@timesheet/utils';
import type { AuthResponse, User } from '@timesheet/types';

// Demo entries seeded for every new account so the app feels alive on first login.
// Managed entirely server-side — the frontend never ships this data.
const SEED_ENTRIES = [
  { title: 'Morning Standup',      from: '09:00', to: '09:30', color: 0, notes: 'Daily sync with team' },
  { title: 'Deep Work – Feature Dev', from: '09:30', to: '12:00', color: 1, notes: 'Auth module implementation' },
  { title: 'Lunch Break',          from: '12:00', to: '13:00', color: 2, notes: '' },
  { title: 'Design Review',        from: '13:00', to: '14:00', color: 4, notes: 'UI feedback session' },
  { title: 'Code Review',          from: '14:00', to: '15:30', color: 0, notes: 'PR #142 and #143' },
  { title: 'Sprint Planning',      from: '15:30', to: '17:00', color: 3, notes: 'Q3 roadmap alignment' },
  { title: 'EOD Wrap-up',          from: '17:00', to: '17:30', color: 6, notes: "Notes & tomorrow's tasks" },
];

const router: Router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

function toPublicUser(doc: InstanceType<typeof UserModel>): User {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    ApiErrors.badRequest(res, parsed.error.issues[0]?.message ?? 'Invalid input');
    return;
  }

  const { name, email, password } = parsed.data;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    ApiErrors.conflict(res, 'Email already registered');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ name, email, passwordHash });
  const token = signToken({ userId: user._id.toString(), email: user.email });

  // Seed demo entries for today so the app feels alive on first login.
  // Fire-and-forget — a failure here must not block account creation.
  void DaySheetModel.create({
    userId: user._id,
    date: todayKey(),
    entries: SEED_ENTRIES.map((e) => ({ ...e, id: genId() })),
  }).catch((err: unknown) => {
    console.error('Failed to seed demo entries for new user:', err);
  });

  sendSuccess<AuthResponse>(res, { user: toPublicUser(user), token }, 201);
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    ApiErrors.badRequest(res, 'Invalid email or password');
    return;
  }

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    ApiErrors.unauthorized(res, 'Invalid email or password');
    return;
  }

  const token = signToken({ userId: user._id.toString(), email: user.email });
  sendSuccess<AuthResponse>(res, { user: toPublicUser(user), token });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const user = await UserModel.findById(authReq.userId);
  if (!user) {
    ApiErrors.unauthorized(res, 'User not found');
    return;
  }

  const token = signToken({ userId: user._id.toString(), email: user.email });
  sendSuccess<AuthResponse>(res, { user: toPublicUser(user), token });
});

// DELETE /api/auth/me
// Permanently deletes the authenticated user.
// The UserModel post('findOneAndDelete') hook cascades deletion to all DaySheets.
router.delete('/me', requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    ApiErrors.notFound(res, 'User not found');
    return;
  }

  // Cascade already fired via Mongoose post-hook in User model.
  sendSuccess(res, { message: 'Account and all associated data deleted.' });
});

export default router;
