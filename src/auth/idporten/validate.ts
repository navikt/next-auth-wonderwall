import { createRemoteJWKSet, jwtVerify, errors } from 'jose';

import { ValidationResult } from '../shared/utils';

import { verifyAndGetTokenXConfig } from './config';
import { getIssuer } from './issuer';

export type IdportenErrorVariants = 'EXPIRED' | 'CLIENT_ID_MISMATCH' | 'NOT_ACR_LEVEL4' | 'UNKNOWN_JOSE_ERROR';
export type IdportenValidationResult = ValidationResult<IdportenErrorVariants>;

let remoteJWKSet: ReturnType<typeof createRemoteJWKSet>;
async function jwkSet(): Promise<ReturnType<typeof createRemoteJWKSet>> {
    if (remoteJWKSet == null) {
        const issuer = await getIssuer();
        remoteJWKSet = createRemoteJWKSet(new URL(<string>issuer.metadata.jwks_uri));
    }

    return remoteJWKSet;
}

export async function validateIdportenToken(bearerToken: string): Promise<IdportenValidationResult> {
    const token = bearerToken.replace('Bearer ', '');
    let verified;
    try {
        verified = await jwtVerify(token, await jwkSet(), {
            issuer: (await getIssuer()).metadata.issuer,
        });
    } catch (err) {
        if (err instanceof errors.JWTExpired) {
            return {
                errorType: 'EXPIRED',
                message: err.message,
                error: err,
            };
        }

        if (err instanceof errors.JOSEError) {
            return {
                errorType: 'UNKNOWN_JOSE_ERROR',
                message: err.message,
                error: err,
            };
        }

        throw err;
    }

    const tokenXConfig = verifyAndGetTokenXConfig();
    if (verified.payload.client_id !== tokenXConfig.clientId) {
        return { errorType: 'CLIENT_ID_MISMATCH', message: 'client_id does not match app client_id' };
    }

    if (verified.payload.acr !== 'Level4') {
        return { errorType: 'NOT_ACR_LEVEL4', message: 'token does not have acr Level4' };
    }

    return 'valid';
}
