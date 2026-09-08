/**
 * Whether the app should show `ApiKeySetupScreen` instead of `RootNavigator`.
 * `App.tsx` owns the check at startup; `clearApiKey` flows (e.g. "Cambiar API
 * Key" in Ajustes) flip it back to `false` from deep inside the navigation
 * tree, so a plain subscribable value stands in for lifting state that far.
 */
type Listener = () => void

let hasKey = false
const listeners = new Set<Listener>()

export function getHasApiKey(): boolean {
  return hasKey
}

export function setHasApiKey(value: boolean): void {
  hasKey = value
  listeners.forEach(listener => listener())
}

export function subscribeApiKeyGate(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
