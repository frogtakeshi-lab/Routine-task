import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useRoutineStore } from '@/stores/routineStore';
import { routineRepo } from '@/db/repositories/routineRepo';
import { calculateStreak, calculateLongestStreak } from '@/utils/streak';
import { isScheduledOn } from '@/utils/recurrence';
import { StreakCard } from '@/components/progress/StreakCard';

const BADGES = [
  { id: '7day', label: '7日連続', icon: '🌟', require: (streak: number) => streak >= 7 },
  { id: '30day', label: '30日連続', icon: '🏆', require: (streak: number) => streak >= 30 },
  { id: '50done', label: '50回完了', icon: '💪', require: (_: number, total: number) => total >= 50 },
  { id: '100done', label: '100回完了', icon: '🎖️', require: (_: number, total: number) => total >= 100 },
];

export default function ProgressScreen() {
  const routines = useRoutineStore((s) => s.routines);
  const today = new Date();

  const weekDays = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end: subDays(today, 0) }).slice(0, 7);
  }, []);

  const allCompletions = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const r of routines) {
      const cs = routineRepo.getCompletionsForRoutine(r.id);
      for (const c of cs) {
        if (!map[c.completedDate]) map[c.completedDate] = new Set();
        map[c.completedDate].add(r.id);
      }
    }
    return map;
  }, [routines]);

  const weekStats = useMemo(() => {
    const DAY_LABELS = ['月', '火', '水', '木', '金', '土', '日'];
    return weekDays.map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      const scheduled = routines.filter((r) => isScheduledOn(r, d));
      const doneIds = allCompletions[dateStr] ?? new Set<string>();
      const done = scheduled.filter((r) => doneIds.has(r.id)).length;
      const rate = scheduled.length > 0 ? done / scheduled.length : 0;
      const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
      return { label: DAY_LABELS[dayIndex], value: Math.round(rate * 100), frontColor: Colors.primary };
    });
  }, [weekDays, routines, allCompletions]);

  const streakData = useMemo(() => {
    return routines
      .filter((r) => r.isActive)
      .map((r) => {
        const completions = routineRepo.getCompletionsForRoutine(r.id);
        const dates = new Set(completions.map((c) => c.completedDate));
        const current = calculateStreak(r, dates);
        const longest = calculateLongestStreak(r, dates);
        return { routine: r, dates, current, longest, total: completions.length };
      })
      .sort((a, b) => b.current - a.current);
  }, [routines]);

  const maxStreak = streakData.reduce((m, s) => Math.max(m, s.current), 0);
  const maxTotal = streakData.reduce((m, s) => Math.max(m, s.total), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>進捗</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>今週の達成率</Text>
          <View style={styles.chart}>
            <BarChart
              data={weekStats}
              barWidth={28}
              spacing={12}
              roundedTop
              xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 11 }}
              yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 11 }}
              noOfSections={4}
              maxValue={100}
              isAnimated
              height={160}
              barBorderRadius={4}
              hideRules
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ルーティン別ストリーク</Text>
          {streakData.length === 0 ? (
            <Text style={styles.empty}>ルーティンがありません</Text>
          ) : (
            streakData.map(({ routine, dates, current, longest }) => (
              <StreakCard
                key={routine.id}
                routine={routine}
                completionDates={dates}
                currentStreak={current}
                longestStreak={longest}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>実績バッジ</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map((badge) => {
              const unlocked = badge.require(maxStreak, maxTotal);
              return (
                <View key={badge.id} style={[styles.badge, !unlocked && styles.badgeLocked]}>
                  <Text style={styles.badgeIcon}>{badge.icon}</Text>
                  <Text style={[styles.badgeLabel, !unlocked && styles.badgeLabelLocked]}>
                    {badge.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.base, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.md },
  section: { marginBottom: Spacing.xl },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.md },
  chart: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md },
  empty: { color: Colors.textDisabled, textAlign: 'center', paddingVertical: Spacing.lg },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badge: {
    width: '47%', backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', gap: Spacing.xs, elevation: 1,
  },
  badgeLocked: { opacity: 0.35 },
  badgeIcon: { fontSize: 28 },
  badgeLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  badgeLabelLocked: { color: Colors.textDisabled },
});
