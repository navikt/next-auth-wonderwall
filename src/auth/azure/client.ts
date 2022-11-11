import { Client, ClientMetadata } from 'openid-client'

import { verifyAndGetAzureConfig } from './config'
import { getIssuer } from './issuer'

let client: Client | null = null
async function getAuthClient(): Promise<Client> {
    if (client) return client

    const azureConfig = verifyAndGetAzureConfig()
    const metadata: ClientMetadata = {
        client_id: azureConfig.clientId,
        client_secret: azureConfig.clientSecret,
        token_endpoint_auth_method: 'client_secret_post',
        response_types: ['code'],
        response_mode: 'query',
    }

    const issuer = await getIssuer()
    client = new issuer.Client(metadata)

    return client
}

export default getAuthClient
