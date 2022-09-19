export function setTokenXWonderwallEnv(clientId: string, privateJwk: string, wellKnownUrl: string): void {
    process.env.TOKEN_X_CLIENT_ID = clientId;
    process.env.TOKEN_X_PRIVATE_JWK = privateJwk;
    process.env.TOKEN_X_WELL_KNOWN_URL = wellKnownUrl;
}
