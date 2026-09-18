const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

/**
 * `src/config/env.ts` bakes BUILD_TARGET into the bundle at transform time.
 * Only these two values mean anything; anything else is a typo that would
 * otherwise ship a bundle pointing at localhost, so it fails here instead.
 */
const BUILD_TARGETS = ['development', 'production']
const buildTarget = (process.env.BUILD_TARGET || 'development')
  .trim()
  .toLowerCase()

if (!BUILD_TARGETS.includes(buildTarget)) {
  throw new Error(
    `BUILD_TARGET="${
      process.env.BUILD_TARGET
    }" is not one of ${BUILD_TARGETS.join(', ')}.`,
  )
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  // Metro's transform cache does not know about env vars, so a bundle built
  // for one target would otherwise reuse the other target's inlined URL.
  // Keying the cache on the target keeps both around without --reset-cache.
  cacheVersion: `build-target:${buildTarget}`,
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
