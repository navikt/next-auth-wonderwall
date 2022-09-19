import { Client } from 'openid-client';
import { JWK } from 'jose';

import { verifyAndGetTokenXConfig } from './config';
import { getIssuer } from './issuer';

let client: Client | null = null;
async function getTokenXAuthClient(): Promise<Client> {
    if (client) return client;

    const tokenXConfig = verifyAndGetTokenXConfig();
    const jwk: JWK = JSON.parse(tokenXConfig.privateJwk);

    const issuer = await getIssuer();
    client = new issuer.Client(
        {
            client_id: tokenXConfig.clientId,
            token_endpoint_auth_method: 'private_key_jwt',
        },
        { keys: [jwk] },
    );

    return client;
}

export default getTokenXAuthClient;