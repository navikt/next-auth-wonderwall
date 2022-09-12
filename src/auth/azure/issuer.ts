import { Client, Issuer } from 'openid-client';

import { verifyAndGetAzureConfig } from './config';

let issuer: Issuer<Client>;
export async function getIssuer(): Promise<Issuer<Client>> {
    if (typeof issuer === 'undefined') {
        const azureConfig = verifyAndGetAzureConfig();

        issuer = await Issuer.discover(azureConfig.discoveryUrl);
    }
    return issuer;
}
