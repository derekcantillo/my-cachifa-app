import React, { useCallback } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useTheme } from '@/theme'
import { formatCurrency } from '@/utils'

interface CurrencyFieldProps {
  label: string
  /** Amount in whole units. Zero renders as an empty field. */
  value: number
  onChange: (value: number) => void
  error?: string
  hint?: string
  autoFocus?: boolean
  /** Renders the amount at display size, for the headline field of a form. */
  large?: boolean
  editable?: boolean
}

/** Digits only: the field owns the formatting, the caller owns the number. */
function toDigits(text: string): number {
  const digits = text.replace(/\D/g, '')
  return digits ? Number(digits) : 0
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
  large = false,
  editable = true,
}: CurrencyFieldProps) {
  const { colors, spacing, typography } = useTheme()

  const handleChangeText = useCallback(
    (text: string) => {
      onChange(toDigits(text))
    },
    [onChange],
  )

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
          large && styles.large,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: error ? colors.negative : colors.border,
            color: colors.text,
            fontSize: large
              ? typography.fontSizes.xxl
              : typography.fontSizes.md,
            fontWeight: large
              ? typography.fontWeights.bold
              : typography.fontWeights.regular,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + spacing.xs / 2,
          },
        ]}
      />

      {error || hint ? (
        <Text
          style={{
            color: error ? colors.negative : colors.textSecondary,
            fontSize: typography.fontSizes.xs,
          }}
        >
          {error ?? hint}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  large: {
    textAlign: 'center',
  },
})
