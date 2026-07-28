import React, { useCallback, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { useTheme } from '@/theme'
import { formatDayLabel, formatMonthYear, toMonthKey } from '@/utils'
import { CalendarIcon, ChevronDownIcon } from './icons'
import type { FieldTone } from './TextField'

/** 'day' reads "Hoy, 24 de octubre"; 'month' reads "Diciembre 2024". */
export type DateFieldFormat = 'day' | 'month'

interface DateFieldProps {
  label: string
  value: Date
  onChange: (value: Date) => void
  /** Latest selectable day, e.g. today for a movement that already happened. */
  maximumDate?: Date
  minimumDate?: Date
  error?: string
  format?: DateFieldFormat
  tone?: FieldTone
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
  format = 'day',
  tone = 'outlined',
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

  const caption =
    format === 'month'
      ? formatMonthYear(toMonthKey(value))
      : formatDayLabel(value)

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
        accessibilityLabel={`${label}: ${caption}`}
        onPress={toggle}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor:
              tone === 'filled' ? colors.surfaceMuted : colors.surface,
            borderColor: error ? colors.negative : colors.border,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm + spacing.xs,
          },
          pressed && styles.pressed,
        ]}
      >
        <CalendarIcon size={20} color={colors.textSecondary} />

        <Text
          numberOfLines={1}
          style={[
            styles.caption,
            {
              color: colors.text,
              fontSize: typography.fontSizes.md,
            },
          ]}
        >
          {caption}
        </Text>

        <ChevronDownIcon size={18} color={colors.textSecondary} />
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
  },
  caption: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
})
