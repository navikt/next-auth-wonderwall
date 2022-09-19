import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

const validClaims = {
    client_id: 'test-client-id',
    acr: 'Level4',
};

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
                    claims: validClaims,
                },
                {
                    requestParam: 'WRONG_CLIENT_ID',
                    match: 'true',
                    claims: {
                        ...validClaims,
                        client_id: 'some-invalid-client-id',
                    },
                },
                {
                    requestParam: 'WRONG_ACR',
                    match: 'true',
                    claims: {
                        ...validClaims,
                        acr: 'Level3',
                    },
                },
            ],
        },
        {
            issuerId: 'azuread',
            requestMappings: [
                {
                    requestParam: 'someparam',
                    match: 'somevalue',
                    claims: {
                        sub: 'subBySomeParam',
                        aud: ['audBySomeParam'],
                    },
                },
            ],
        },
    ],
};

export const MOCK_OAUTH_SERVER_PORT = 8080;

export async function startMockOauth2ServerContainer(): Promise<StartedTestContainer> {
    return await new GenericContainer('ghcr.io/navikt/mock-oauth2-server:0.5.1')
        .withEnv('LOG_LEVEL', 'DEBUG')
        .withEnv('JSON_CONFIG', JSON.stringify(mockOauth2ServerJsonConfig))
        .withExposedPorts(MOCK_OAUTH_SERVER_PORT)
        .withWaitStrategy(Wait.forLogMessage(/.*started server.*/))
        .start()
        .then((it) => {
            console.info(
                `Started mock-oauth2-server on http://${it.getHost()}:${it.getMappedPort(MOCK_OAUTH_SERVER_PORT)}`,
            );
            return it;
        });
}

export function getPort(container: StartedTestContainer): number {
    return container.getMappedPort(MOCK_OAUTH_SERVER_PORT);
}
