import { createRemoteJWKSet } from 'jose'

import { getIssuer } from './issuer'

let remoteJWKSet: ReturnType<typeof createRemoteJWKSet>
export async function getJwkSet(): Promise<ReturnType<typeof createRemoteJWKSet>> {
    if (remoteJWKSet == null) {
        const issuer = await getIssuer()
        remoteJWKSet = createRemoteJWKSet(new URL(<string>issuer.metadata.jwks_uri))
    }

    return remoteJWKSet
}
