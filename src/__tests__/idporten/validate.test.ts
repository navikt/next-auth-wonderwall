import { StartedTestContainer } from 'testcontainers';

import { validateIdportenToken, ValidationError } from '../../auth';
import { setTokenXWonderwallEnv } from '../../testUtils/configUtils';
import { getFakeIdportenToken } from '../../testUtils/fakeTokens';
import { getPort, startMockOauth2ServerContainer } from '../../testUtils/mockOauth2ServerContainer';
import { IdportenErrorVariants, IdportenValidationResult } from '../../auth/idporten/validate';

jest.setTimeout(90000);

describe('idporten token', () => {
    let container: StartedTestContainer;
    let mockOauthServerUrl: string;

    beforeAll(async () => {
        container = await startMockOauth2ServerContainer();

        setTokenXWonderwallEnv(
            'test-client-id',
            'unused for validation',
            `http://localhost:${getPort(container)}/idporten/.well-known/openid-configuration`,
        );

        mockOauthServerUrl = `http://localhost:${getPort(container)}`;
    });

    it('should be valid when valid', async () => {
        const tokendingsToken = await getFakeIdportenToken(mockOauthServerUrl, 'VALID');
        const result = await validateIdportenToken(tokendingsToken.access_token);

        expect(result).toEqual('valid');
    });

    it('should be invalid when token is expired', async () => {
        const tokendingsToken = await getFakeIdportenToken(mockOauthServerUrl, 'VALID');

        await wait(5 * 1000);

        const result = await validateIdportenToken(tokendingsToken.access_token);

        assertResultIsError(result);
        expect(result.errorType).toEqual('EXPIRED');
    });

    it('should be invalid when wrong client_id', async () => {
        const tokendingsToken = await getFakeIdportenToken(mockOauthServerUrl, 'WRONG_CLIENT_ID');
        const result = await validateIdportenToken(tokendingsToken.access_token);

        assertResultIsError(result);
        expect(result.errorType).toEqual('CLIENT_ID_MISMATCH');
    });

    it('should be invalid when not ACR Level4', async () => {
        const tokendingsToken = await getFakeIdportenToken(mockOauthServerUrl, 'WRONG_ACR');
        const result = await validateIdportenToken(tokendingsToken.access_token);

        assertResultIsError(result);
        expect(result.errorType).toEqual('NOT_ACR_LEVEL4');
    });
});

function assertResultIsError(input: IdportenValidationResult): asserts input is ValidationError<IdportenErrorVariants> {
    if (input === 'valid') {
        throw new Error("Expected result to be an error, but was 'valid'");
    }
}

async function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
