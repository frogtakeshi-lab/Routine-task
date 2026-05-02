import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import type { Routine } from '@/types/routine';

interface RoutineItemProps {
  routine: Routine;
  isCompleted: boolean;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function RoutineItem({ routine, isCompleted, onToggle, onEdit, onDelete }: RoutineItemProps) {
  const recurrenceLabel =
    routine.recurrenceType === 'daily'
      ? '毎日'
      : routine.weekDays.map((d) => DAY_LABELS[d]).join('・');

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        <View style={[styles.checkCircle, { borderColor: routine.colorTag }, isCompleted && { backgroundColor: routine.colorTag }]}>
          {isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.completed]}>{routine.title}</Text>
        <Text style={styles.sub}>{recurrenceLabel}</Text>
      </View>

      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={styles.action}>
          <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.action}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  checkbox: { marginRight: Spacing.md },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  completed: { textDecorationLine: 'line-through', color: Colors.textDisabled },
  sub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  action: { padding: Spacing.xs },
});
