import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { LandingScreen } from '../screens/LandingScreen'
import { OnboardingScreen } from '../screens/OnboardingScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { colors } from '../utils/theme'

export function AuthGate() {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (status === 'unauthenticated') {
    return <LandingScreen />
  }

  if (status === 'pending') {
    return <OnboardingScreen />
  }

  return <DashboardScreen />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
