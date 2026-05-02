import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useRoutineStore } from '@/stores/routineStore';
import { useTodoStore } from '@/stores/todoStore';
import { useCalendarMarks } from '@/hooks/useCalendarMarks';
import { isScheduledOn } from '@/utils/recurrence';
import { RoutineItem } from '@/components/routine/RoutineItem';
import { TodoItem } from '@/components/todo/TodoItem';
import { todayString } from '@/utils/dateHelpers';

export default function CalendarScreen() {
  const today = todayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [showSheet, setShowSheet] = useState(false);

  const routines = useRoutineStore((s) => s.routines);
  const completions = useRoutineStore((s) => s.completions);
  const toggleCompletion = useRoutineStore((s) => s.toggleCompletion);
  const loadCompletionsForRange = useRoutineStore((s) => s.loadCompletionsForRange);
  const todos = useTodoStore((s) => s.todos);
  const toggleComplete = useTodoStore((s) => s.toggleComplete);

  const markedDates = useCalendarMarks(visibleMonth);

  const selectedMark = markedDates[selectedDate] ?? {};
  const combinedMarked = {
    ...markedDates,
    [selectedDate]: { ...selectedMark, selected: true, selectedColor: Colors.primary },
  };

  const handleMonthChange = useCallback((month: { dateString: string }) => {
    const d = new Date(month.dateString + 'T00:00:00');
    setVisibleMonth(d);
    const start = format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
    const end = format(new Date(d.getFullYear(), d.getMonth() + 1, 0), 'yyyy-MM-dd');
    loadCompletionsForRange(start, end);
  }, [loadCompletionsForRange]);

  const dayRoutines = routines.filter((r) => {
    const d = new Date(selectedDate + 'T00:00:00');
    return isScheduledOn(r, d);
  });
  const completedIds = new Set((completions[selectedDate] ?? []).map((c) => c.routineId));
  const dayTodos = todos.filter((t) => t.deadline === selectedDate);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>カレンダー</Text>

      <Calendar
        onDayPress={(day: { dateString: string }) => { setSelectedDate(day.dateString); setShowSheet(true); }}
        onMonthChange={handleMonthChange}
        markingType="multi-dot"
        markedDates={combinedMarked}
        theme={{
          backgroundColor: Colors.background,
          calendarBackground: Colors.surface,
          selectedDayBackgroundColor: Colors.primary,
          todayTextColor: Colors.primary,
          arrowColor: Colors.primary,
          dotColor: Colors.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
        }}
        style={styles.calendar}
      />

      <Modal visible={showSheet} animationType="slide" transparent onRequestClose={() => setShowSheet(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{selectedDate}</Text>
              <TouchableOpacity onPress={() => setShowSheet(false)}>
                <Text style={styles.sheetClose}>閉じる</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {dayRoutines.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>ルーティン ({dayRoutines.length})</Text>
                  {dayRoutines.map((r) => (
                    <RoutineItem
                      key={r.id}
                      routine={r}
                      isCompleted={completedIds.has(r.id)}
                      onToggle={() => toggleCompletion(r.id, selectedDate)}
                    />
                  ))}
                </>
              )}

              {dayTodos.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Todo期限 ({dayTodos.length})</Text>
                  {dayTodos.map((t) => (
                    <TodoItem
                      key={t.id}
                      todo={t}
                      onToggle={() => toggleComplete(t.id)}
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  ))}
                </>
              )}

              {dayRoutines.length === 0 && dayTodos.length === 0 && (
                <Text style={styles.emptyDay}>この日の予定はありません</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, padding: Spacing.base, paddingBottom: Spacing.xs },
  calendar: { borderRadius: Radius.lg, marginHorizontal: Spacing.base, overflow: 'hidden' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.base, maxHeight: '70%',
  },
  sheetHandle: { width: 36, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  sheetClose: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  emptyDay: { textAlign: 'center', color: Colors.textDisabled, paddingVertical: Spacing.xl },
});
