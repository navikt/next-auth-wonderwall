type FakeIdPortenResult = {
    access_token: string;
    token_type: string;
};

type FakeTokenVariant = 'VALID' | 'WRONG_CLIENT_ID' | 'WRONG_ACR';

export async function getFakeIdportenToken(
    mockOauth2ServerUrl: string,
    variant: FakeTokenVariant = 'VALID',
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
