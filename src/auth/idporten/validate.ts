import { ValidationResult } from '../shared/utils';
import { verifyJwt } from '../shared/verify';

import { verifyAndGetTokenXConfig } from './config';
import { getIdportenIssuer } from './issuer';
import { getJwkSet } from './jwk';

export type IdportenErrorVariants = 'EXPIRED' | 'CLIENT_ID_MISMATCH' | 'NOT_ACR_LEVEL4' | 'UNKNOWN_JOSE_ERROR';
export type IdportenValidationResult = ValidationResult<IdportenErrorVariants>;

export async function validateIdportenToken(bearerToken: string): Promise<IdportenValidationResult> {
    const verificationResult = await verifyJwt(bearerToken, await getJwkSet(), await getIdportenIssuer());

    if ('errorType' in verificationResult) {
        return verificationResult;
    }

    const tokenXConfig = verifyAndGetTokenXConfig();
    if (verificationResult.payload.client_id !== tokenXConfig.clientId) {
        return { errorType: 'CLIENT_ID_MISMATCH', message: 'client_id does not match app client_id' };
    }

    if (verificationResult.payload.acr !== 'Level4') {
        return { errorType: 'NOT_ACR_LEVEL4', message: 'token does not have acr Level4' };
    }

    return 'valid';
}
