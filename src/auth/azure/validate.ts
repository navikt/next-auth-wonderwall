import { ValidationResult } from '../shared/utils';
import { verifyJwt } from '../shared/verify';

import { verifyAndGetAzureConfig } from './config';
import { getIssuer } from './issuer';
import { getJwkSet } from './jwk';

export type AzureAdErrorVariants = 'EXPIRED' | 'CLIENT_ID_MISMATCH' | 'UNKNOWN_JOSE_ERROR';
export type AzureAdValidationResult = ValidationResult<AzureAdErrorVariants>;

export async function validateAzureToken(bearerToken: string): Promise<ValidationResult<AzureAdErrorVariants>> {
    const verificationResult = await verifyJwt(bearerToken, await getJwkSet(), await getIssuer());

    if ('errorType' in verificationResult) {
        return verificationResult;
    }

    const azureConfig = verifyAndGetAzureConfig();
    if (verificationResult.payload.aud !== azureConfig.clientId) {
        return { errorType: 'CLIENT_ID_MISMATCH', message: 'client_id does not match app client_id' };
    }

    return 'valid';
}
