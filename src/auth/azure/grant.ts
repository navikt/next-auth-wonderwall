import { GrantBody } from 'openid-client';

import { getTokenInCache, setTokenInCache } from '../cache';
import { RPError, OPError } from '../shared/oidcUtils';

import getAzureAuthClient from './client';

export async function grantAzureOboToken(userToken: string, scope: string): Promise<string | undefined> {
    const cacheKey = `azure-${userToken}-${scope}`;
    const [cacheHit, tokenInCache] = getTokenInCache(cacheKey);
    if (cacheHit) return tokenInCache;

    const client = await getAzureAuthClient();
    const grantBody: GrantBody = {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        requested_token_use: 'on_behalf_of',
        scope,
        assertion: userToken,
    };

    try {
        const tokenSet = await client.grant(grantBody);
        setTokenInCache(cacheKey, tokenSet);
        return tokenSet.access_token;
    } catch (err) {
        if (err instanceof OPError || err instanceof RPError) {
            // logger.error(createOidcUnknownError(err));
            throw err;
        }

        if (!(err instanceof Error)) {
            // logger.error('Unknown error from openid-client');
            // logger.error(err);
            throw err;
        }

        // logger.error('Unknown error from openid-client');
        throw err;
    }
}
