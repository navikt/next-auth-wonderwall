import { custom } from 'openid-client'

custom.setHttpOptionsDefaults({
    timeout: 5000,
})

export * from './auth'
