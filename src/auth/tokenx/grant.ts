import { GrantBody } from 'openid-client';

import { createOidcUnknownError, OPError, RPError } from '../shared/oidcUtils';
import { getTokenInCache, setTokenInCache } from '../cache';
import { GrantResult } from '../shared/types';

import getTokenXAuthClient from './client';

export async function grantTokenXOboToken(subjectToken: string, audience: string): Promise<GrantResult> {
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
            return {
                errorType: 'OIDC_OP_RP_ERROR',
                message: createOidcUnknownError(err),
                error: err,
            };
        }

        if (err instanceof Error) {
            return {
                errorType: 'OIDC_UNKNOWN_ERROR',
                message: 'Unknown error from openid-client',
                error: err,
            };
        }

        return {
            errorType: 'UNKNOWN_ERROR',
            message: 'Unknown error',
            error: err,
        };
    }
}
