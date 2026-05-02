import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import type { Priority } from '@/types/todo';

const OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: Colors.priorityHigh },
  { value: 'medium', label: '中', color: Colors.priorityMedium },
  { value: 'low', label: '低', color: Colors.priorityLow },
];

interface PrioritySelectorProps {
  value: Priority;
  onChange: (p: Priority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.btn, value === opt.value && { backgroundColor: opt.color, borderColor: opt.color }]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.txt, value === opt.value && styles.txtActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  btn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  txt: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  txtActive: { color: '#fff' },
});
