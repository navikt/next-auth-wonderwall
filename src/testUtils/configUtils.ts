export function setTokenXWonderwallEnv(clientId: string, privateJwk: string, wellKnownUrl: string): void {
    process.env.TOKEN_X_CLIENT_ID = clientId;
    process.env.TOKEN_X_PRIVATE_JWK = privateJwk;
    process.env.TOKEN_X_WELL_KNOWN_URL = wellKnownUrl;
}

export function setAzureAdWonderwallEnv(clientId: string, clientSecret: string, discoveryUrl: string): void {
    process.env.AZURE_APP_CLIENT_ID = clientId;
    process.env.AZURE_APP_CLIENT_SECRET = clientSecret;
    process.env.AZURE_APP_WELL_KNOWN_URL = discoveryUrl;
}
