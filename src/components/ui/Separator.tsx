import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '@/theme'

/** Hairline divider between list rows. */
export function Separator() {
  const { colors } = useTheme()

  return <View style={[styles.line, { backgroundColor: colors.border }]} />
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
  },
})
