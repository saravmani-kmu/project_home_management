import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { completeOnboarding as completeOnboardingRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { colors } from '../utils/theme'

export function OnboardingScreen() {
  const { pendingToken, completeOnboarding } = useAuth()
  const [name, setName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [familyNameError, setFamilyNameError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!pendingToken) return

    let hasError = false
    if (!name.trim()) {
      setNameError('Enter your name.')
      hasError = true
    }
    if (!familyName.trim()) {
      setFamilyNameError('Give your household a name.')
      hasError = true
    }
    if (hasError) return

    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const result = await completeOnboardingRequest({
        pendingToken,
        name: name.trim(),
        familyName: familyName.trim(),
      })
      await completeOnboarding(result.member, result.sessionToken)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.')
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.card}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>H</Text>
          </View>
          <Text style={styles.title}>Welcome to Hearth</Text>
          <Text style={styles.subtitle}>Let's set up your household.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Your name</Text>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value)
                if (nameError) setNameError(null)
              }}
              placeholder="e.g. Meera"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoFocus
            />
            {nameError && <Text style={styles.error}>{nameError}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Family name</Text>
            <TextInput
              value={familyName}
              onChangeText={(value) => {
                setFamilyName(value)
                if (familyNameError) setFamilyNameError(null)
              }}
              placeholder="e.g. The Sharma Family"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            {familyNameError && <Text style={styles.error}>{familyNameError}</Text>}
          </View>

          {submitError && <Text style={styles.error}>{submitError}</Text>}

          <Pressable
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create household</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  field: {
    marginTop: 20,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    backgroundColor: colors.card,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
    color: colors.danger,
  },
  submitButton: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
})
