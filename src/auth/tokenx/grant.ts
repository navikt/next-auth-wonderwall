import { GrantBody } from 'openid-client';

import { createOidcUnknownError, OPError, RPError } from '../shared/oidcUtils';
import { getTokenInCache, setTokenInCache } from '../cache';

import getTokenXAuthClient from './client';

export async function grantTokenXOboToken(subjectToken: string, audience: string): Promise<string | undefined> {
    const cacheKey = `tokenx-${subjectToken}-${audience}`;
    const [cacheHit, tokenInCache] = getTokenInCache(cacheKey);
    if (cacheHit) return tokenInCache;

    const client = await getTokenXAuthClient();
    const now = Math.floor(Date.now() / 1000);
    const additionalClaims = {
        clientAssertionPayload: {
            nbf: now,
            aud: client.issuer.metadata.token_endpoint,
        },
    };

    const grantBody: GrantBody = {
        grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        audience,
        subject_token: subjectToken,
    };

    try {
        const tokenSet = await client.grant(grantBody, additionalClaims);
        setTokenInCache(cacheKey, tokenSet);
        return tokenSet.access_token;
    } catch (err: unknown) {
        if (err instanceof OPError || err instanceof RPError) {
            // logger.error(createOidcUnknownError(err));
            return;
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
