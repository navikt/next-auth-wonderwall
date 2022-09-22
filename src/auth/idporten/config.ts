import { z } from 'zod';

export interface TokenXConfig {
    clientId: string;
    privateJwk: string;
    tokenXWellKnownUrl: string;
    idportenWellKnownUrl: string;
}

const RequiredTokenXConfigSchema = z.object({
    clientId: z.string(),
    privateJwk: z.string(),
    tokenXWellKnownUrl: z.string(),
    idportenWellKnownUrl: z.string(),
});

export function verifyAndGetTokenXConfig(): TokenXConfig {
    const parsedEnv = RequiredTokenXConfigSchema.safeParse({
        clientId: process.env.TOKEN_X_CLIENT_ID,
        privateJwk: process.env.TOKEN_X_PRIVATE_JWK,
        tokenXWellKnownUrl: process.env.TOKEN_X_WELL_KNOWN_URL,
        idportenWellKnownUrl: process.env.IDPORTEN_WELL_KNOWN_URL,
    });

    if (parsedEnv.success) {
        return parsedEnv.data;
    }

    throw new Error(
        `Missing environment variable ${JSON.stringify(
            parsedEnv.error.errors,
            null,
            2,
        )}. Are you sure you have enabled TokenX Wonderwall in your nais.yml for this environment?`,
    );
}
