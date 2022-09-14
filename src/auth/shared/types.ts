export type ValidationResult<ErrorTypes extends string> = 'valid' | { errorType: ErrorTypes; message: string };

export type GrantResult =
    | string
    | undefined
    | {
          errorType: 'OIDC_OP_RP_ERROR' | 'OIDC_UNKNOWN_ERROR' | 'UNKNOWN_ERROR';
          message: string;
          error?: Error | unknown;
      };
