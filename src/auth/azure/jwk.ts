import { createRemoteJWKSet } from 'jose';

import { getIssuer } from './issuer';

let _remoteJWKSet: ReturnType<typeof createRemoteJWKSet>;
export async function getJwkSet(): Promise<ReturnType<typeof createRemoteJWKSet>> {
    if (typeof _remoteJWKSet === 'undefined') {
        const issuer = await getIssuer();
        _remoteJWKSet = createRemoteJWKSet(new URL(<string>issuer.metadata.jwks_uri));
    }

    return _remoteJWKSet;
}
