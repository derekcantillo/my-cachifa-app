import React, { useCallback } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'
import type { FieldTone } from './TextField'

interface CurrencyFieldProps {
  label: string
  /** Amount in whole units. Zero renders as an empty field. */
  value: number
  onChange: (value: number) => void
  error?: string
  hint?: string
  autoFocus?: boolean
  /**
   * Headline amount of a form: centered, oversized, with the currency sign
   * beside it and a single rule underneath instead of a box.
   */
  hero?: boolean
  editable?: boolean
  tone?: FieldTone
}

const CURRENCY_SIGN = '$'

/** Digits only: the field owns the formatting, the caller owns the number. */
function toDigits(text: string): number {
  const digits = text.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

/** Amount without the currency sign, which the hero layout renders on its own. */
function formatDigits(value: number): string {
  return formatCurrency(value).replace(CURRENCY_SIGN, '').trim()
}

/**
 * Currency input that reformats as the user types — they enter digits and see
 * "$ 1.250" — so the amount never has to be typed with separators.
 */
export function CurrencyField({
  label,
  value,
  onChange,
  error,
  hint,
  autoFocus = false,
  hero = false,
  editable = true,
  tone = 'outlined',
}: CurrencyFieldProps) {
  const { colors, spacing, typography } = useTheme()

  const handleChangeText = useCallback(
    (text: string) => {
      onChange(toDigits(text))
    },
    [onChange],
  )

  const caption = error || hint

  if (hero) {
    return (
      <View style={[styles.hero, { gap: spacing.xs }]}>
        <Text
          style={[
            styles.heroLabel,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSizes.xs,
              fontWeight: typography.fontWeights.medium,
            },
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.heroRow,
            {
              borderBottomColor: error ? colors.negative : colors.border,
              gap: spacing.sm,
              paddingBottom: spacing.xs,
            },
          ]}
        >
          <Text
            style={{
              color: colors.primary,
              fontSize: typography.fontSizes.xl,
              fontWeight: typography.fontWeights.bold,
            }}
          >
            {CURRENCY_SIGN}
          </Text>

          <TextInput
            accessibilityLabel={label}
            value={value > 0 ? formatDigits(value) : ''}
            onChangeText={handleChangeText}
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            autoFocus={autoFocus}
            editable={editable}
            style={[
              styles.heroInput,
              {
                color: colors.text,
                fontSize: typography.fontSizes.xxl,
                fontWeight: typography.fontWeights.bold,
              },
            ]}
          />
        </View>

        {caption ? (
          <Text
            style={[
              styles.heroLabel,
              {
                color: error ? colors.negative : colors.textSecondary,
                fontSize: typography.fontSizes.xs,
              },
            ]}
          >
            {caption}
          </Text>
        ) : null}
      </View>
    )
  }

  return (
    <View style={{ gap: spacing.xs }}>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: typography.fontSizes.sm,
          fontWeight: typography.fontWeights.medium,
        }}
      >
        {label}
      </Text>

      <TextInput
        accessibilityLabel={label}
        value={value > 0 ? formatCurrency(value) : ''}
        onChangeText={handleChangeText}
        placeholder={formatCurrency(0)}
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        autoFocus={autoFocus}
        editable={editable}
        style={[
          styles.input,
          {
            backgroundColor:
              tone === 'filled' ? colors.surfaceMuted : colors.surface,
            borderColor: error ? colors.negative : colors.border,
            color: colors.text,
            fontSize: typography.fontSizes.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + spacing.xs / 2,
          },
        ]}
      />

      {caption ? (
        <Text
          style={{
            color: error ? colors.negative : colors.textSecondary,
            fontSize: typography.fontSizes.xs,
          }}
        >
          {caption}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
  },
  hero: {
    alignItems: 'center',
  },
  heroLabel: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    minWidth: '60%',
  },
  heroInput: {
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
})
