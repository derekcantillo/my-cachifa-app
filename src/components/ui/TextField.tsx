import React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native'
import { useTheme } from '@/theme'

/** 'outlined' sits on a card, 'filled' on the plain sheet background. */
export type FieldTone = 'outlined' | 'filled'

interface TextFieldProps {
  label: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  /** Shown under the field in the negative color; also outlines the input. */
  error?: string
  /** Quiet line under the field when there is no error. */
  hint?: string
  keyboardType?: KeyboardTypeOptions
  autoFocus?: boolean
  multiline?: boolean
  editable?: boolean
  tone?: FieldTone
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  keyboardType,
  autoFocus = false,
  multiline = false,
  editable = true,
  tone = 'outlined',
  secureTextEntry = false,
  autoCapitalize,
}: TextFieldProps) {
  const { colors, spacing, typography } = useTheme()

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
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        autoFocus={autoFocus}
        multiline={multiline}
        editable={editable}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          multiline && styles.multiline,
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

const MULTILINE_HEIGHT = 88

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
  },
  multiline: {
    height: MULTILINE_HEIGHT,
    textAlignVertical: 'top',
  },
})
