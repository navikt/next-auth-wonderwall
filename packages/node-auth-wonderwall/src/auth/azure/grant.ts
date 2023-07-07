import { GrantBody } from 'openid-client'

import { getTokenInCache, setTokenInCache } from '../cache'
import { RPError, OPError, createOidcUnknownError } from '../shared/oidcUtils'
import { GrantResult } from '../shared/utils'

import getAzureAuthClient from './client'

export async function grantAzureOboToken(userToken: string, scope: string): Promise<GrantResult> {
    const cacheKey = `azure-${userToken}-${scope}`
    const [cacheHit, tokenInCache] = getTokenInCache(cacheKey)
    if (cacheHit) return tokenInCache

    const client = await getAzureAuthClient()
    const grantBody: GrantBody = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        requested_token_use: 'on_behalf_of',
        scope,
        assertion: userToken,
    }

    try {
        const tokenSet = await client.grant(grantBody)
        setTokenInCache(cacheKey, tokenSet)
        if (!tokenSet.access_token) {
            return {
                errorType: 'NO_TOKEN',
                message: 'TokenSet does not contain an access_token',
            }
        }
        return tokenSet.access_token
    } catch (err) {
        if (err instanceof OPError || err instanceof RPError) {
            return {
                errorType: 'OIDC_OP_RP_ERROR',
                message: createOidcUnknownError(err),
                error: err,
            }
        }

        if (err instanceof Error) {
            return {
                errorType: 'OIDC_UNKNOWN_ERROR',
                message: 'Unknown error from openid-client',
                error: err,
            }
        }

        return {
            errorType: 'UNKNOWN_ERROR',
            message: 'Unknown error',
            error: err,
        }
    }
}
