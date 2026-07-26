import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchMembers } from '../api/members'
import { fetchTasks } from '../api/tasks'
import { MemberAvatar } from '../components/MemberAvatar'
import { Badge } from '../components/Badge'
import { useAuth, useRequireAdmin } from '../context/AuthContext'
import type { FamilyMember, Task } from '../types'
import { categoryMeta, formatDueDate, isOverdue, priorityMeta, statusMeta } from '../utils/taskMeta'
import { colors } from '../utils/theme'

export function DashboardScreen() {
  const admin = useRequireAdmin()
  const { logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedMembers] = await Promise.all([fetchTasks(), fetchMembers()])
      setTasks(fetchedTasks)
      setMembers(fetchedMembers)
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load tasks.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const membersById = new Map(members.map((member) => [member.id, member]))

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    )
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Household tasks</Text>
          <Text style={styles.subtitle}>Viewing as {admin.name}</Text>
        </View>
        <Pressable onPress={logout} hitSlop={8}>
          <MemberAvatar member={admin} size={36} />
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
              Create a task from the web app to see it appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const assignee = membersById.get(item.assigneeId)
          const overdue = isOverdue(item.dueAt, item.status)
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {assignee && <MemberAvatar member={assignee} size={24} />}
              </View>

              {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.badgeRow}>
                <Badge label={statusMeta[item.status].label} tone={statusMeta[item.status].tone} />
                <Badge
                  label={priorityMeta[item.priority].label}
                  tone={priorityMeta[item.priority].tone}
                />
                <Badge label={categoryMeta[item.category].label} tone="neutral" />
              </View>

              <Text style={[styles.dueDate, overdue && styles.overdue]}>
                {overdue ? 'Overdue · ' : ''}
                {formatDueDate(item.dueAt)}
              </Text>
            </View>
          )
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  overdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
