import axios from 'axios'
import { env } from '@/config/env'

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
})

let authToken: string | null = null

/**
 * The backend doesn't expose authentication yet. This lets a future login
 * flow attach a bearer token without touching any repository call site.
 */
export function setAuthToken(token: string | null): void {
  authToken = token
}

httpClient.interceptors.request.use(config => {
  if (authToken) {
    config.headers.set('Authorization', `Bearer ${authToken}`)
  }
  return config
})
