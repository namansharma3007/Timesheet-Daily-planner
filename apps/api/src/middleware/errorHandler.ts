import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ApiErrors } from '../utils/response';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  console.error('Unhandled error:', err);
  ApiErrors.internal(res);
};
