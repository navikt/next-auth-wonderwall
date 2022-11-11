import { StartedTestContainer } from 'testcontainers'

import { AzureAdErrorVariants, AzureAdValidationResult, validateAzureToken, ValidationError } from '../../auth'
import { setAzureAdWonderwallEnv } from '../../testUtils/configUtils'
import wait from '../../testUtils/wait'
import { getFakeAzureAdToken } from '../../testUtils/fakeTokens'
import {
    getMockOauthServerUrl,
    getWellKnownUrl,
    startMockOauth2ServerContainer,
} from '../../testUtils/mockOauth2ServerContainer'

describe('azure token', () => {
    let container: StartedTestContainer
    let mockOauthServerUrl: string

    beforeAll(async () => {
        container = await startMockOauth2ServerContainer()
        setAzureAdWonderwallEnv('test-client-id', 'unused for validation', getWellKnownUrl(container, 'azure'))
        mockOauthServerUrl = getMockOauthServerUrl(container)
    })

    it('should be valid when valid', async () => {
        const wonderwallToken = await getFakeAzureAdToken(mockOauthServerUrl, 'VALID')
        const result = await validateAzureToken(wonderwallToken.access_token)

        expect(result).toEqual('valid')
    })

    it('should be invalid when token is expired', async () => {
        const wonderwallToken = await getFakeAzureAdToken(mockOauthServerUrl, 'VALID')

        await wait(5 * 1000)

        const result = await validateAzureToken(wonderwallToken.access_token)

        assertResultIsError(result)
        expect(result.errorType).toEqual('EXPIRED')
    })

    it('should be invalid when wrong client_id', async () => {
        const wonderwallToken = await getFakeAzureAdToken(mockOauthServerUrl, 'WRONG_CLIENT_ID')
        const result = await validateAzureToken(wonderwallToken.access_token)

        assertResultIsError(result)
        expect(result.errorType).toEqual('CLIENT_ID_MISMATCH')
    })
})

function assertResultIsError(input: AzureAdValidationResult): asserts input is ValidationError<AzureAdErrorVariants> {
    if (input === 'valid') {
        throw new Error("Expected result to be an error, but was 'valid'")
    }
}
