type FakeIdPortenResult = {
    access_token: string;
    token_type: string;
};

type FakeIdportenTokenVariant = 'VALID' | 'WRONG_CLIENT_ID' | 'WRONG_ACR';

export async function getFakeIdportenToken(
    mockOauth2ServerUrl: string,
    variant: FakeIdportenTokenVariant = 'VALID',
): Promise<FakeIdPortenResult> {
    const fakeToken = await fetch(`${mockOauth2ServerUrl}/idporten/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            [variant]: 'true',
            scope: 'idporten',
            grant_type: 'client_credentials',
            client_id: 'foo',
            client_secret: 'bar',
        }),
    }).then((it) => it.text());

    return JSON.parse(fakeToken);
}

type FakeAzureAdTokenVariant = 'VALID' | 'WRONG_CLIENT_ID';

export async function getFakeAzureAdToken(
    mockOauth2ServerUrl: string,
    variant: FakeAzureAdTokenVariant = 'VALID',
): Promise<FakeIdPortenResult> {
    const fakeToken = await fetch(`${mockOauth2ServerUrl}/azure/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            [variant]: 'true',
            scope: 'azuread',
            grant_type: 'client_credentials',
            client_id: 'foo',
            client_secret: 'bar',
        }),
    }).then((it) => it.text());

    return JSON.parse(fakeToken);
}
