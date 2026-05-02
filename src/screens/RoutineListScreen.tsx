import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useRoutineStore } from '@/stores/routineStore';
import { RoutineItem } from '@/components/routine/RoutineItem';
import { EmptyState } from '@/components/common/EmptyState';
import type { RootStackParamList } from '@/types/navigation';
import type { Routine, RecurrenceType } from '@/types/routine';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'all' | 'daily' | 'weekly';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'すべて' },
  { key: 'daily', label: '毎日' },
  { key: 'weekly', label: '毎週' },
];

export default function RoutineListScreen() {
  const navigation = useNavigation<Nav>();
  const routines = useRoutineStore((s) => s.routines);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);

  const [filter, setFilter] = useState<FilterType>('all');

  const filtered: Routine[] =
    filter === 'all'
      ? routines
      : routines.filter((r) => r.recurrenceType === (filter as RecurrenceType));

  function handleDelete(id: string) {
    Alert.alert('削除確認', 'このルーティンを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>ルーティン管理</Text>
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
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <RoutineItem
            routine={item}
            isCompleted={false}
            onToggle={() => {}}
            onEdit={() => navigation.navigate('RoutineForm', { routineId: item.id })}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="repeat-outline"
            title="ルーティンがありません"
            subtitle="＋ボタンから追加してください"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('RoutineForm', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, paddingBottom: Spacing.xs },
  backBtn: { marginRight: Spacing.xs },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
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
