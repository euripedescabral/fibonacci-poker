export const ERROR_CODES = ['INVALID_INPUT','SESSION_EXPIRED','TABLE_NOT_FOUND','TABLE_FULL','OBSERVER_CANNOT_VOTE','ROUND_CLOSED','STALE_ROUND','NO_VOTES','COMMAND_CONFLICT','ALREADY_PROCESSED','CONNECTION_REPLACED','RATE_LIMITED','STORAGE_UNAVAILABLE','SERVER_RESTARTING','SERVER_BUSY','CLIENT_OUTDATED'] as const;
export type ErrorCode = typeof ERROR_CODES[number];
export class AppError extends Error {
  constructor(public readonly code: ErrorCode) { super(code); this.name = 'AppError'; }
}
export function errorCode(error: unknown): ErrorCode {
  return error instanceof AppError ? error.code : 'STORAGE_UNAVAILABLE';
}
