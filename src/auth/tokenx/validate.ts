import { createRemoteJWKSet, jwtVerify } from 'jose';

import { ValidationResult } from '../shared/types';

import { verifyAndGetTokenXConfig } from './config';
import { getIssuer } from './issuer';

let _remoteJWKSet: ReturnType<typeof createRemoteJWKSet>;
async function jwkSet(): Promise<ReturnType<typeof createRemoteJWKSet>> {
    if (typeof _remoteJWKSet === 'undefined') {
        const iss = await getIssuer();
        _remoteJWKSet = createRemoteJWKSet(new URL(<string>iss.metadata.jwks_uri));
    }

    return _remoteJWKSet;
}

export async function validateTokenXToken(
    bearerToken: string,
): Promise<ValidationResult<'EXPIRED' | 'CLIENT_ID_MISMATCH' | 'NOT_ACR_LEVEL4'>> {
    const token = bearerToken.replace('Bearer ', '');
    const verified = await jwtVerify(token, await jwkSet(), {
        issuer: (await getIssuer()).metadata.issuer,
    });

    if (verified.payload.exp && verified.payload.exp * 1000 <= Date.now()) {
        return { errorType: 'EXPIRED', message: 'token is expired' };
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
