/**
 * Types for the virtual `@env` module created by `react-native-dotenv`.
 * Every key declared here must exist in `.env.example`.
 */
declare module '@env' {
  export const API_BASE_URL: string | undefined
  export const API_HOST: string | undefined
  export const API_PORT: string | undefined
  export const API_TIMEOUT_MS: string | undefined
  export const API_MODE: string | undefined
  export const MOCK_FAILURE_RATE: string | undefined
}
