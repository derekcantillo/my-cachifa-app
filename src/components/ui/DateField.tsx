import React, { useCallback, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { useTheme } from '@/theme'
import { formatFullDate } from '@/utils'

interface DateFieldProps {
  label: string
  value: Date
  onChange: (value: Date) => void
  /** Latest selectable day, e.g. today for a movement that already happened. */
  maximumDate?: Date
  minimumDate?: Date
  error?: string
}

/**
 * Date input backed by the platform picker: a dialog on Android, an inline
 * calendar that unfolds under the field on iOS.
 */
export function DateField({
  label,
  value,
  onChange,
  maximumDate,
  minimumDate,
  error,
}: DateFieldProps) {
  const { colors, scheme, spacing, typography } = useTheme()
  const [open, setOpen] = useState(false)

  const handleChange = useCallback(
    (event: DateTimePickerEvent, selected?: Date) => {
      // Android's dialog closes itself on any outcome; iOS keeps the inline
      // calendar open until the field is tapped again.
      if (Platform.OS !== 'ios') {
        setOpen(false)
      }
      if (event.type === 'set' && selected) {
        onChange(selected)
      }
    },
    [onChange],
  )

  const toggle = useCallback(() => {
    setOpen(current => !current)
  }, [])

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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatFullDate(value)}`}
        onPress={toggle}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: error ? colors.negative : colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + spacing.xs,
          },
          pressed && styles.pressed,
        ]}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: typography.fontSizes.md,
          }}
        >
          {formatFullDate(value)}
        </Text>
      </Pressable>

      {open && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
          themeVariant={scheme}
        />
      )}

      {error ? (
        <Text
          style={{ color: colors.negative, fontSize: typography.fontSizes.xs }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
  },
})
