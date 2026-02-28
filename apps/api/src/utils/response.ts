import type { Response } from 'express';
import type { ApiError } from '@timesheet/types';

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json(data);
}

export function sendError(res: Response, statusCode: number, message: string, code: string): void {
  const body: ApiError = { message, code, statusCode };
  res.status(statusCode).json(body);
}

export const ApiErrors = {
  badRequest: (res: Response, message: string) => sendError(res, 400, message, 'BAD_REQUEST'),
  unauthorized: (res: Response, message = 'Unauthorized') =>
    sendError(res, 401, message, 'UNAUTHORIZED'),
  notFound: (res: Response, message = 'Not found') => sendError(res, 404, message, 'NOT_FOUND'),
  conflict: (res: Response, message: string) => sendError(res, 409, message, 'CONFLICT'),
  internal: (res: Response, message = 'Internal server error') =>
    sendError(res, 500, message, 'INTERNAL_ERROR'),
};
