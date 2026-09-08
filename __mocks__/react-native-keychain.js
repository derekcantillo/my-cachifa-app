/**
 * Keychain/Keystore has no JS implementation under Jest, so tests get an
 * in-memory stand-in keyed by `service`. Manual mocks for node_modules are
 * picked up automatically — no `jest.mock` call needed.
 */
const store = new Map()

function setGenericPassword(username, password, options) {
  const service = options?.service ?? 'default'
  store.set(service, { service, username, password, storage: 'mock' })
  return Promise.resolve({ service, storage: 'mock' })
}

function getGenericPassword(options) {
  const service = options?.service ?? 'default'
  const entry = store.get(service)
  return Promise.resolve(entry ?? false)
}

function hasGenericPassword(options) {
  const service = options?.service ?? 'default'
  return Promise.resolve(store.has(service))
}

function resetGenericPassword(options) {
  const service = options?.service ?? 'default'
  store.delete(service)
  return Promise.resolve(true)
}

module.exports = {
  setGenericPassword,
  getGenericPassword,
  hasGenericPassword,
  resetGenericPassword,
}
