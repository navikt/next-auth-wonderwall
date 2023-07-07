import { errors } from 'openid-client'

export const OPError = errors.OPError
export const RPError = errors.RPError

export const createOidcUnknownError = (err: errors.OPError | errors.RPError): string =>
    `Noe gikk galt med token exchange mot TokenX. 
     Feilmelding fra openid-client: (${err}). 
     HTTP Status fra TokenX: (${err.response?.statusCode} ${err.response?.statusMessage})
     Body fra TokenX: ${JSON.stringify(err.response?.body)}`
