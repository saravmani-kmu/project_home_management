import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signInWithGoogle } from '../api/googleAuth'
import { useAuth } from '../context/AuthContext'
import { colors } from '../utils/theme'

export function LandingScreen() {
  const { beginSession, beginPendingOnboarding } = useAuth()
  const [loadingIntent, setLoadingIntent] = useState<'login' | 'signup' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handlePress(intent: 'login' | 'signup') {
    setError(null)
    setLoadingIntent(intent)
    try {
      const outcome = await signInWithGoogle(intent)
      if (outcome.type === 'session') {
        await beginSession(outcome.token)
      } else if (outcome.type === 'pending') {
        beginPendingOnboarding(outcome.token)
      }
      // 'cancelled' — user backed out of the browser, nothing to do.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoadingIntent(null)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>H</Text>
        </View>
        <Text style={styles.title}>Hearth</Text>
        <Text style={styles.subtitle}>
          The place your household keeps track of tasks, chores, and each other.
        </Text>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.buttonOutline]}
            onPress={() => handlePress('login')}
            disabled={loadingIntent !== null}
          >
            {loadingIntent === 'login' ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.buttonOutlineText}>Log in with Google</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.button, styles.buttonFilled]}
            onPress={() => handlePress('signup')}
            disabled={loadingIntent !== null}
          >
            {loadingIntent === 'signup' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonFilledText}>Sign up with Google</Text>
            )}
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.hint}>
          Sign up creates a new household. Log in if you or your household already have one.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    textAlign: 'center',
  },
  buttons: {
    marginTop: 24,
    width: '100%',
    gap: 12,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  buttonOutlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  buttonFilled: {
    backgroundColor: colors.accent,
  },
  buttonFilledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  error: {
    marginTop: 16,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
  hint: {
    marginTop: 20,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
