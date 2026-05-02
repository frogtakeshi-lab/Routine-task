import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import type { RecurrenceType, WeekDay } from '@/types/routine';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

interface FrequencyPickerProps {
  recurrenceType: RecurrenceType;
  weekDays: WeekDay[];
  onTypeChange: (t: RecurrenceType) => void;
  onWeekDaysChange: (days: WeekDay[]) => void;
}

export function FrequencyPicker({ recurrenceType, weekDays, onTypeChange, onWeekDaysChange }: FrequencyPickerProps) {
  function toggleDay(day: WeekDay) {
    const next = weekDays.includes(day) ? weekDays.filter((d) => d !== day) : [...weekDays, day];
    onWeekDaysChange(next.sort((a, b) => a - b) as WeekDay[]);
  }

  return (
    <View>
      <View style={styles.typeRow}>
        {(['daily', 'weekly'] as RecurrenceType[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => onTypeChange(t)}
            style={[styles.typeBtn, recurrenceType === t && styles.typeBtnActive]}
          >
            <Text style={[styles.typeTxt, recurrenceType === t && styles.typeTxtActive]}>
              {t === 'daily' ? '毎日' : '毎週'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {recurrenceType === 'weekly' && (
        <View style={styles.daysRow}>
          {(DAY_LABELS).map((label, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => toggleDay(i as WeekDay)}
              style={[styles.dayBtn, weekDays.includes(i as WeekDay) && styles.dayBtnActive]}
            >
              <Text style={[styles.dayTxt, weekDays.includes(i as WeekDay) && styles.dayTxtActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  typeBtn: {
    flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeTxt: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  typeTxtActive: { color: '#fff' },
  daysRow: { flexDirection: 'row', gap: 4 },
  dayBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1,
    borderColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  dayBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayTxt: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  dayTxtActive: { color: '#fff' },
});
