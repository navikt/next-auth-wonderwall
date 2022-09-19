import { z } from 'zod';

export interface TokenXConfig {
    clientId: string;
    privateJwk: string;
    wellKnownUrl: string;
}

const RequiredTokenXConfigSchema = z.object({
    clientId: z.string(),
    privateJwk: z.string(),
    wellKnownUrl: z.string(),
});

export function verifyAndGetTokenXConfig(): TokenXConfig {
    const parsedEnv = RequiredTokenXConfigSchema.safeParse({
        clientId: process.env.TOKEN_X_CLIENT_ID,
        privateJwk: process.env.TOKEN_X_PRIVATE_JWK,
        wellKnownUrl: process.env.TOKEN_X_WELL_KNOWN_URL,
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
