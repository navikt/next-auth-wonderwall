import { randomUUID } from 'crypto'

import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers'

const validIdportenClaims = {
    client_id: 'idporten-test-client-id',
    acr: 'Level4',
    client_amr: 'private_key_jwt',
    sub: randomUUID(),
    aud: 'notfound',
    at_hash: randomUUID(),
    amr: ['BankId'],
    pid: 'user-pid',
    locale: 'nb',
    sid: randomUUID(),
    auth_time: Date.now(),
}

const validAzureAdClaims = {
    aud: 'test-client-id',
}

const mockOauth2ServerJsonConfig = {
    interactiveLogin: true,
    httpServer: 'NettyWrapper',
    tokenCallbacks: [
        {
            issuerId: 'idporten',
            tokenExpiry: 3,
            requestMappings: [
                {
                    requestParam: 'VALID',
                    match: 'true',
                    claims: validIdportenClaims,
                },
                {
                    requestParam: 'WRONG_CLIENT_ID',
                    match: 'true',
                    claims: {
                        ...validIdportenClaims,
                        client_id: 'some-invalid-client-id',
                    },
                },
                {
                    requestParam: 'WRONG_ACR',
                    match: 'true',
                    claims: {
                        ...validIdportenClaims,
                        acr: 'Level3',
                    },
                },
            ],
        },
        {
            issuerId: 'azure',
            tokenExpiry: 3,
            requestMappings: [
                {
                    requestParam: 'VALID',
                    match: 'true',
                    claims: validAzureAdClaims,
                },
                {
                    requestParam: 'WRONG_CLIENT_ID',
                    match: 'true',
                    claims: { ...validAzureAdClaims, aud: 'some-invalid-client-id' },
                },
            ],
        },
    ],
}

export const MOCK_OAUTH_SERVER_PORT = 8080

export async function startMockOauth2ServerContainer(): Promise<StartedTestContainer> {
    return await new GenericContainer('ghcr.io/navikt/mock-oauth2-server:0.5.1')
        .withEnvironment({ LOG_LEVEL: 'DEBUG', JSON_CONFIG: JSON.stringify(mockOauth2ServerJsonConfig) })
        .withExposedPorts(MOCK_OAUTH_SERVER_PORT)
        .withWaitStrategy(Wait.forLogMessage(/.*started server.*/))
        .start()
        .then((it) => {
            console.info(
                `Started mock-oauth2-server on http://${it.getHost()}:${it.getMappedPort(MOCK_OAUTH_SERVER_PORT)}`,
            )
            return it
        })
}

export function getPort(container: StartedTestContainer): number {
    return container.getMappedPort(MOCK_OAUTH_SERVER_PORT)
}

export function getWellKnownUrl(container: StartedTestContainer, issuer: 'idporten' | 'azure'): string {
    return `http://localhost:${getPort(container)}/${issuer}/.well-known/openid-configuration`
}

export function getMockOauthServerUrl(container: StartedTestContainer): string {
    return `http://localhost:${getPort(container)}`
}
