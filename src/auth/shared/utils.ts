export type ValidationResult<ErrorTypes extends string> = 'valid' | ValidationError<ErrorTypes>;

export type ValidationError<ErrorTypes extends string> = {
    errorType: ErrorTypes;
    message: string;
    error?: Error | unknown;
};

export type GrantError = {
    errorType: 'OIDC_OP_RP_ERROR' | 'OIDC_UNKNOWN_ERROR' | 'UNKNOWN_ERROR' | 'NO_TOKEN';
    message: string;
    error?: Error | unknown;
};

export type GrantResult = string | GrantError;

export function isInvalidTokenSet(grantResult: GrantResult): grantResult is GrantError {
    return typeof grantResult !== 'string';
}
