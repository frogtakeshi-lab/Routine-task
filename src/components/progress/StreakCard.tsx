import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { format, subDays } from 'date-fns';
import { isScheduledOn } from '@/utils/recurrence';
import type { Routine } from '@/types/routine';

interface StreakCardProps {
  routine: Routine;
  completionDates: Set<string>;
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ routine, completionDates, currentStreak, longestStreak }: StreakCardProps) {
  const today = new Date();
  const last7: { date: string; scheduled: boolean; done: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    last7.push({ date: dateStr, scheduled: isScheduledOn(routine, d), done: completionDates.has(dateStr) });
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: routine.colorTag }]} />
        <Text style={styles.name} numberOfLines={1}>{routine.title}</Text>
        <Text style={styles.streak}>🔥 {currentStreak}日</Text>
      </View>

      <View style={styles.miniRow}>
        {last7.map((d) => (
          <View
            key={d.date}
            style={[
              styles.miniDot,
              !d.scheduled && styles.miniDotSkip,
              d.scheduled && d.done && styles.miniDotDone,
              d.scheduled && !d.done && styles.miniDotMissed,
            ]}
          />
        ))}
      </View>

      <Text style={styles.longest}>最長: {longestStreak}日</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.sm, elevation: 1,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  name: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  streak: { fontSize: 15, fontWeight: '700', color: Colors.warning },
  miniRow: { flexDirection: 'row', gap: 4, marginBottom: Spacing.xs },
  miniDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
  miniDotSkip: { backgroundColor: 'transparent' },
  miniDotDone: { backgroundColor: Colors.success },
  miniDotMissed: { backgroundColor: Colors.danger },
  longest: { fontSize: 11, color: Colors.textSecondary },
});
