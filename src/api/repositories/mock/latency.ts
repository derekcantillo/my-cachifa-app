/** Simulates network latency so mock loading states behave like the real API. */
export function simulateLatency(minMs = 300, maxMs = 800): Promise<void> {
  const duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise(resolve => setTimeout(resolve, duration))
}
