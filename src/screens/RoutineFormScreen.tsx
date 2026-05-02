import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useRoutineStore } from '@/stores/routineStore';
import { FrequencyPicker } from '@/components/routine/FrequencyPicker';
import type { RootStackParamList } from '@/types/navigation';
import type { RecurrenceType, WeekDay } from '@/types/routine';

type Props = NativeStackScreenProps<RootStackParamList, 'RoutineForm'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RoutineFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { routineId } = route.params ?? {};

  const routines = useRoutineStore((s) => s.routines);
  const addRoutine = useRoutineStore((s) => s.addRoutine);
  const updateRoutine = useRoutineStore((s) => s.updateRoutine);
  const deleteRoutine = useRoutineStore((s) => s.deleteRoutine);

  const existing = routineId ? routines.find((r) => r.id === routineId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(existing?.recurrenceType ?? 'daily');
  const [weekDays, setWeekDays] = useState<WeekDay[]>(existing?.weekDays ?? []);
  const [colorTag, setColorTag] = useState(existing?.colorTag ?? Colors.routineColors[0]);
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  const isEdit = !!existing;
  const headerTitle = isEdit ? 'ルーティンを編集' : 'ルーティンを追加';

  useLayoutEffect(() => {
    navigation.setOptions({ title: headerTitle });
  }, [headerTitle]);

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }
    if (recurrenceType === 'weekly' && weekDays.length === 0) {
      Alert.alert('エラー', '曜日を1つ以上選択してください');
      return;
    }
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      recurrenceType,
      weekDays: recurrenceType === 'daily' ? [] : weekDays,
      colorTag,
      isActive,
    };
    if (isEdit) {
      updateRoutine(routineId!, data);
    } else {
      addRoutine(data);
    }
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert('削除', 'このルーティンを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive',
        onPress: () => { deleteRoutine(routineId!); navigation.goBack(); },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>タイトル *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 朝の運動"
        placeholderTextColor={Colors.textDisabled}
        maxLength={50}
      />

      <Text style={styles.label}>説明（任意）</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={description}
        onChangeText={setDescription}
        placeholder="メモ"
        placeholderTextColor={Colors.textDisabled}
        multiline
        numberOfLines={3}
        maxLength={200}
      />

      <Text style={styles.label}>繰り返し</Text>
      <FrequencyPicker
        recurrenceType={recurrenceType}
        weekDays={weekDays}
        onTypeChange={setRecurrenceType}
        onWeekDaysChange={setWeekDays}
      />

      <Text style={[styles.label, { marginTop: Spacing.md }]}>カラー</Text>
      <View style={styles.colorRow}>
        {Colors.routineColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorDot, { backgroundColor: color }, colorTag === color && styles.colorDotSelected]}
            onPress={() => setColorTag(color)}
          />
        ))}
      </View>

      <View style={styles.toggleRow}>
        <Text style={styles.label}>アクティブ</Text>
        <TouchableOpacity
          style={[styles.toggle, isActive && styles.toggleOn]}
          onPress={() => setIsActive(!isActive)}
        >
          <View style={[styles.toggleThumb, isActive && styles.toggleThumbOn]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{isEdit ? '更新する' : '追加する'}</Text>
      </TouchableOpacity>

      {isEdit && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>削除する</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.base, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: 15, color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  colorRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.textPrimary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleOn: { backgroundColor: Colors.primary },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.lg,
    padding: Spacing.base, alignItems: 'center', marginTop: Spacing.xl,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  deleteBtn: {
    borderRadius: Radius.lg, padding: Spacing.base, alignItems: 'center', marginTop: Spacing.sm,
    borderWidth: 1, borderColor: Colors.danger,
  },
  deleteBtnText: { color: Colors.danger, fontSize: 16, fontWeight: '600' },
});
