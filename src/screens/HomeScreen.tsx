import React, { useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useRoutineStore } from '@/stores/routineStore';
import { useTodoStore } from '@/stores/todoStore';
import { todayString, formatJapanese } from '@/utils/dateHelpers';
import { isScheduledOn } from '@/utils/recurrence';
import { RoutineItem } from '@/components/routine/RoutineItem';
import { SectionHeader } from '@/components/common/SectionHeader';
import { EmptyState } from '@/components/common/EmptyState';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const today = todayString();

  const routines = useRoutineStore((s) => s.routines);
  const completions = useRoutineStore((s) => s.completions);
  const toggleCompletion = useRoutineStore((s) => s.toggleCompletion);
  const loadRoutines = useRoutineStore((s) => s.loadRoutines);
  const loadCompletionsForRange = useRoutineStore((s) => s.loadCompletionsForRange);
  const loadTodos = useTodoStore((s) => s.loadTodos);
  const todos = useTodoStore((s) => s.todos);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
      loadTodos();
      loadCompletionsForRange(today, today);
    }, [today]),
  );

  const todayRoutines = useMemo(
    () => routines.filter((r) => isScheduledOn(r, new Date())),
    [routines],
  );

  const completedIds = useMemo(
    () => new Set((completions[today] ?? []).map((c) => c.routineId)),
    [completions, today],
  );

  const completedCount = todayRoutines.filter((r) => completedIds.has(r.id)).length;
  const pct = todayRoutines.length > 0 ? Math.round((completedCount / todayRoutines.length) * 100) : 0;

  const priorityTodos = useMemo(
    () =>
      todos
        .filter((t) => !t.isCompleted && (t.priority === 'high' || t.priority === 'medium'))
        .sort((a, b) => (a.priority === 'high' ? -1 : 1))
        .slice(0, 3),
    [todos],
  );

  function handleAddMenu() {
    Alert.alert('追加', undefined, [
      { text: 'ルーティンを追加', onPress: () => navigation.navigate('RoutineForm', {}) },
      { text: 'Todoを追加', onPress: () => navigation.navigate('TodoForm', {}) },
      { text: 'キャンセル', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{formatJapanese(new Date())}</Text>
          <Text style={styles.greeting}>今日も頑張ろう！</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>今日の達成率</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%` as `${number}%` }]} />
          </View>
          <Text style={styles.progressSub}>{completedCount} / {todayRoutines.length} 完了</Text>
        </View>

        <SectionHeader
          title="今日のルーティン"
          actionLabel="管理"
          onAction={() => navigation.navigate('RoutineList')}
        />

        {todayRoutines.length === 0 ? (
          <EmptyState
            icon="repeat-outline"
            title="ルーティンがありません"
            subtitle="＋ボタンから追加してください"
          />
        ) : (
          todayRoutines.map((routine) => (
            <RoutineItem
              key={routine.id}
              routine={routine}
              isCompleted={completedIds.has(routine.id)}
              onToggle={() => toggleCompletion(routine.id, today)}
              onEdit={() => navigation.navigate('RoutineForm', { routineId: routine.id })}
            />
          ))
        )}

        {priorityTodos.length > 0 && (
          <View style={styles.sectionGap}>
            <SectionHeader title="優先Todo" />
            {priorityTodos.map((todo) => (
              <TouchableOpacity
                key={todo.id}
                style={styles.todoRow}
                onPress={() => navigation.navigate('TodoForm', { todoId: todo.id })}
              >
                <View style={[styles.priorityDot, { backgroundColor: todo.priority === 'high' ? Colors.priorityHigh : Colors.priorityMedium }]} />
                <Text style={styles.todoTitle} numberOfLines={1}>{todo.title}</Text>
                {todo.deadline && <Text style={styles.deadline}>{todo.deadline}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddMenu}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 100 },
  header: { marginBottom: Spacing.base },
  dateText: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  greeting: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  progressCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
  },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  progressPct: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  progressBarBg: { height: 8, backgroundColor: '#C7D2FE', borderRadius: 4, marginBottom: Spacing.xs },
  progressBarFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressSub: { fontSize: 12, color: Colors.textSecondary },
  sectionGap: { marginTop: Spacing.lg },
  todoRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.xs,
    elevation: 1,
  },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: Spacing.sm },
  todoTitle: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  deadline: { fontSize: 12, color: Colors.textSecondary },
  fab: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
});
