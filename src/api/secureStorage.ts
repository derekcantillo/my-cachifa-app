import * as Keychain from 'react-native-keychain'

/**
 * Identifies this app's entry in Keychain/Keystore. Kept separate from any
 * other credential the device might store so `resetGenericPassword` here
 * can never touch something unrelated.
 */
const SERVICE = 'my-cachifa-api-key'

/** Keychain stores a username/password pair; the key rides as the password. */
const USERNAME = 'my-cachifa-api-key'

export async function getApiKey(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE })
  return credentials ? credentials.password : null
}

export async function setApiKey(key: string): Promise<void> {
  await Keychain.setGenericPassword(USERNAME, key, { service: SERVICE })
}

export async function clearApiKey(): Promise<void> {
  await Keychain.resetGenericPassword({ service: SERVICE })
}

export async function hasApiKey(): Promise<boolean> {
  return Keychain.hasGenericPassword({ service: SERVICE })
}
