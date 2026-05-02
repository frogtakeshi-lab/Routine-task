import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import type { Todo, Priority } from '@/types/todo';

const PRIORITY_COLOR: Record<Priority, string> = {
  high: Colors.priorityHigh,
  medium: Colors.priorityMedium,
  low: Colors.priorityLow,
};

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.stripe, { backgroundColor: PRIORITY_COLOR[todo.priority] }]} />
      <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
        <View style={[styles.checkCircle, todo.isCompleted && styles.checkCircleDone]}>
          {todo.isCompleted && <Ionicons name="checkmark" size={13} color="#fff" />}
        </View>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, todo.isCompleted && styles.completed]} numberOfLines={2}>
          {todo.title}
        </Text>
        {todo.deadline && (
          <Text style={[styles.deadline, todo.isCompleted && styles.completed]}>
            期限: {todo.deadline}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={onEdit} style={styles.icon}>
        <Ionicons name="pencil-outline" size={17} color={Colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.icon}>
        <Ionicons name="trash-outline" size={17} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    marginBottom: Spacing.xs, overflow: 'hidden',
    elevation: 1,
  },
  stripe: { width: 4, alignSelf: 'stretch' },
  checkbox: { padding: Spacing.md },
  checkCircle: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  content: { flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.xs },
  title: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  completed: { textDecorationLine: 'line-through', color: Colors.textDisabled },
  deadline: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  icon: { padding: Spacing.sm },
});
