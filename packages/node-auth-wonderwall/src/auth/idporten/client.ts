import { Client } from 'openid-client'
import { JWK } from 'jose'

import { verifyAndGetTokenXConfig } from './config'
import { getTokenXIssuer } from './issuer'

let client: Client | null = null
async function getTokenXAuthClient(): Promise<Client> {
    if (client) return client

    const tokenXConfig = verifyAndGetTokenXConfig()
    const jwk: JWK = JSON.parse(tokenXConfig.privateJwk)

    const issuer = await getTokenXIssuer()
    client = new issuer.Client(
        {
            client_id: tokenXConfig.tokenXClientId,
            token_endpoint_auth_method: 'private_key_jwt',
        },
        { keys: [jwk] },
    )

    return client
}

export default getTokenXAuthClient
