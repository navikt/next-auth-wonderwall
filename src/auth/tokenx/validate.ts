import { createRemoteJWKSet, jwtVerify } from 'jose';

import { verifyAndGetTokenXConfig } from './config';
import { getIssuer } from './issuer';

const tokenXConfig = verifyAndGetTokenXConfig();

let _remoteJWKSet: ReturnType<typeof createRemoteJWKSet>;
async function jwkSet(): Promise<ReturnType<typeof createRemoteJWKSet>> {
    if (typeof _remoteJWKSet === 'undefined') {
        const iss = await getIssuer();
        _remoteJWKSet = createRemoteJWKSet(new URL(<string>iss.metadata.jwks_uri));
    }

    return _remoteJWKSet;
}

export async function validateTokenXToken(bearerToken: string): Promise<ValidationResult> {
    const token = bearerToken.replace('Bearer ', '');
    const verified = await jwtVerify(token, await jwkSet(), {
        issuer: (await getIssuer()).metadata.issuer,
    });

    if (verified.payload.exp && verified.payload.exp * 1000 <= Date.now()) {
        return { error: 'token is expired' };
    }

    if (verified.payload.client_id !== tokenXConfig.clientId) {
        return { error: 'client_id does not match app client_id' };
    }

    if (verified.payload.acr !== 'Level4') {
        return { error: 'token does not have acr Level4' };
    }

    return 'ok';
}
