import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useTodoStore } from '@/stores/todoStore';
import { TodoItem } from '@/components/todo/TodoItem';
import { EmptyState } from '@/components/common/EmptyState';
import type { RootStackParamList } from '@/types/navigation';
import type { Todo } from '@/types/todo';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'active' | 'done';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export default function TodoListScreen() {
  const navigation = useNavigation<Nav>();
  const todos = useTodoStore((s) => s.todos);
  const toggleComplete = useTodoStore((s) => s.toggleComplete);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);

  const [filter, setFilter] = useState<Filter>('active');

  const filtered = useMemo(() => {
    let list: Todo[];
    if (filter === 'active') list = todos.filter((t) => !t.isCompleted);
    else if (filter === 'done') list = todos.filter((t) => t.isCompleted);
    else list = [...todos];
    return list.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (pr !== 0) return pr;
      if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [todos, filter]);

  function handleDelete(id: string) {
    Alert.alert('削除', 'このTodoを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => deleteTodo(id) },
    ]);
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'active', label: '未完了' },
    { key: 'done', label: '完了' },
    { key: 'all', label: 'すべて' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Todo</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterTxt, filter === f.key && styles.filterTxtActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TodoItem
            todo={item}
            onToggle={() => toggleComplete(item.id)}
            onEdit={() => navigation.navigate('TodoForm', { todoId: item.id })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-outline"
            title="Todoがありません"
            subtitle="＋ボタンから追加してください"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TodoForm', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerRow: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.xs },
  screenTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  filterBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterTxt: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterTxtActive: { color: '#fff' },
  list: { padding: Spacing.base, paddingBottom: 100 },
  fab: {
    position: 'absolute', right: Spacing.xl, bottom: Spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },
});
