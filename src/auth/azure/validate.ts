import { createRemoteJWKSet, jwtVerify } from 'jose';

import { ValidationResult } from '../shared/utils';

import { verifyAndGetAzureConfig } from './config';
import { getIssuer } from './issuer';

let _remoteJWKSet: ReturnType<typeof createRemoteJWKSet>;
async function jwkSet(): Promise<ReturnType<typeof createRemoteJWKSet>> {
    if (typeof _remoteJWKSet === 'undefined') {
        const iss = await getIssuer();
        _remoteJWKSet = createRemoteJWKSet(new URL(<string>iss.metadata.jwks_uri));
    }

    return _remoteJWKSet;
}

export async function validateAzureToken(
    bearerToken: string,
): Promise<ValidationResult<'EXPIRED' | 'CLIENT_ID_MISMATCH'>> {
    const token = bearerToken.replace('Bearer ', '');
    const verified = await jwtVerify(token, await jwkSet(), {
        issuer: (await getIssuer()).metadata.issuer,
    });

    if (verified.payload.exp && verified.payload.exp * 1000 <= Date.now()) {
        return { errorType: 'EXPIRED', message: 'token is expired' };
    }

    const azureConfig = verifyAndGetAzureConfig();
    if (verified.payload.aud !== azureConfig.clientId) {
        return { errorType: 'CLIENT_ID_MISMATCH', message: 'client_id does not match app client_id' };
    }

    return 'valid';
}
