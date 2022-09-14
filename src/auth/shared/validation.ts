export type ValidationResult<ErrorTypes extends string> = 'valid' | { errorType: ErrorTypes; message: string };
