const LOCALE = 'es-CO'
const CURRENCY = 'COP'

interface FormatCurrencyOptions {
  /** Show the decimal part. Defaults to false — COP amounts are shown whole. */
  withDecimals?: boolean
  /** Prefix positive amounts with '+'. Useful for income rows. */
  signed?: boolean
}

const formatters = new Map<number, Intl.NumberFormat>()

function getFormatter(fractionDigits: number): Intl.NumberFormat {
  const cached = formatters.get(fractionDigits)
  if (cached) {
    return cached
  }

  const formatter = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  formatters.set(fractionDigits, formatter)
  return formatter
}

/**
 * Formats an amount as Colombian pesos, e.g. 1250.4 -> "$ 1.250".
 * Amounts keep their own sign unless `signed` asks for an explicit '+'.
 */
export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {},
): string {
  const { withDecimals = false, signed = false } = options
  const formatted = getFormatter(withDecimals ? 2 : 0).format(amount)

  return signed && amount > 0 ? `+${formatted}` : formatted
}

/** Short form for tight spaces (ring labels, chart axes): 1250000 -> "$ 1,3 M". */
export function formatCurrencyCompact(amount: number): string {
  const absolute = Math.abs(amount)

  if (absolute >= 1_000_000) {
    return `${getFormatter(1).format(amount / 1_000_000)} M`
  }

  if (absolute >= 10_000) {
    return `${getFormatter(0).format(Math.round(amount / 1000))} k`
  }

  return formatCurrency(amount)
}
