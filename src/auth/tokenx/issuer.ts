import { Client, Issuer } from 'openid-client';

import { verifyAndGetTokenXConfig } from './config';

let issuer: Issuer<Client>;
export async function getIssuer(): Promise<Issuer<Client>> {
    if (issuer == null) {
        const tokenXConfig = verifyAndGetTokenXConfig();

        issuer = await Issuer.discover(tokenXConfig.wellKnownUrl);
    }
    return issuer;
}
