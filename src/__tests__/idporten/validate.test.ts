import { StartedTestContainer } from 'testcontainers'

import { validateIdportenToken, ValidationError, IdportenErrorVariants, IdportenValidationResult } from '../../auth'
import { setTokenXWonderwallEnv } from '../../testUtils/configUtils'
import { getFakeIdportenToken } from '../../testUtils/fakeTokens'
import wait from '../../testUtils/wait'
import {
    getWellKnownUrl,
    startMockOauth2ServerContainer,
    getMockOauthServerUrl,
} from '../../testUtils/mockOauth2ServerContainer'

describe('idporten token', () => {
    let container: StartedTestContainer
    let mockOauthServerUrl: string

    beforeAll(async () => {
        container = await startMockOauth2ServerContainer()
        setTokenXWonderwallEnv(
            'tokenx-test-client-id',
            'idporten-test-client-id',
            'unused for validation',
            getWellKnownUrl(container, 'idporten'),
        )
        mockOauthServerUrl = getMockOauthServerUrl(container)
    })

    it('should be valid when valid', async () => {
        const wonderwallToken = await getFakeIdportenToken(mockOauthServerUrl, 'VALID')
        const result = await validateIdportenToken(wonderwallToken.access_token)

        expect(result).toEqual('valid')
    })

    it('should be invalid when token is expired', async () => {
        const wonderwallToken = await getFakeIdportenToken(mockOauthServerUrl, 'VALID')

        await wait(5 * 1000)

        const result = await validateIdportenToken(wonderwallToken.access_token)

        assertResultIsError(result)
        expect(result.errorType).toEqual('EXPIRED')
    })

    it('should be invalid when wrong client_id', async () => {
        const wonderwallToken = await getFakeIdportenToken(mockOauthServerUrl, 'WRONG_CLIENT_ID')
        const result = await validateIdportenToken(wonderwallToken.access_token)

        assertResultIsError(result)
        expect(result.errorType).toEqual('CLIENT_ID_MISMATCH')
    })

    it('should be invalid when not ACR Level4', async () => {
        const wonderwallToken = await getFakeIdportenToken(mockOauthServerUrl, 'WRONG_ACR')
        const result = await validateIdportenToken(wonderwallToken.access_token)

        assertResultIsError(result)
        expect(result.errorType).toEqual('NOT_ACR_LEVEL4')
    })
})

function assertResultIsError(input: IdportenValidationResult): asserts input is ValidationError<IdportenErrorVariants> {
    if (input === 'valid') {
        throw new Error("Expected result to be an error, but was 'valid'")
    }
}
