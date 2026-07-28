import React from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/theme'
import { ModalHeader, type ModalHeaderLeading } from '../ui/ModalHeader'

interface ModalScreenProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  leading?: ModalHeaderLeading
  /** Trailing header controls, e.g. edit and delete. */
  headerActions?: React.ReactNode
  brandTitle?: boolean
  /** Pinned above the bottom edge, out of the scroll — the primary action. */
  footer?: React.ReactNode
  /** Draws the sheet grabber above the header, as the register modal does. */
  grabber?: boolean
}

/**
 * Chrome shared by the modal routes: header, scrolling body and a footer that
 * stays pinned to the bottom edge so the primary action is always reachable.
 */
export function ModalScreen({
  title,
  onClose,
  children,
  leading = 'back',
  headerActions,
  brandTitle = false,
  footer,
  grabber = false,
}: ModalScreenProps) {
  const { colors, spacing } = useTheme()

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      {grabber && (
        <View style={[styles.grabberRow, { paddingTop: spacing.sm }]}>
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />
        </View>
      )}

      <ModalHeader
        title={title}
        onClose={onClose}
        leading={leading}
        actions={headerActions}
        brandTitle={brandTitle}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: spacing.md,
            paddingBottom: spacing.xl,
            gap: spacing.md,
          }}
        >
          {children}
        </ScrollView>

        {footer ? (
          <View
            style={[
              styles.footer,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                padding: spacing.md,
                gap: spacing.sm,
              },
            ]}
          >
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const GRABBER_WIDTH = 44
const GRABBER_HEIGHT = 5

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  grabberRow: {
    alignItems: 'center',
  },
  grabber: {
    width: GRABBER_WIDTH,
    height: GRABBER_HEIGHT,
    borderRadius: GRABBER_HEIGHT / 2,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
})
