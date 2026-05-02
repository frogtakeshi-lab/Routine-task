import React, { useState, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/layout';
import { useTodoStore } from '@/stores/todoStore';
import { PrioritySelector } from '@/components/todo/PrioritySelector';
import type { RootStackParamList } from '@/types/navigation';
import type { Priority } from '@/types/todo';

type Props = NativeStackScreenProps<RootStackParamList, 'TodoForm'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function TodoFormScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { todoId } = route.params ?? {};

  const todos = useTodoStore((s) => s.todos);
  const addTodo = useTodoStore((s) => s.addTodo);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const deleteTodo = useTodoStore((s) => s.deleteTodo);

  const existing = todoId ? todos.find((t) => t.id === todoId) : undefined;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? 'medium');
  const [deadline, setDeadline] = useState<Date | null>(
    existing?.deadline ? new Date(existing.deadline + 'T00:00:00') : null,
  );
  const [showPicker, setShowPicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Todoを編集' : 'Todoを追加' });
  }, [isEdit]);

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      deadline: deadline ? deadline.toISOString().slice(0, 10) : undefined,
      isCompleted: existing?.isCompleted ?? false,
      completedAt: existing?.completedAt,
    };
    if (isEdit) {
      updateTodo(todoId!, data);
    } else {
      addTodo(data);
    }
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert('削除', 'このTodoを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive',
        onPress: () => { deleteTodo(todoId!); navigation.goBack(); },
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
        placeholder="例: レポートを提出する"
        placeholderTextColor={Colors.textDisabled}
        maxLength={80}
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
        maxLength={300}
      />

      <Text style={styles.label}>優先度</Text>
      <PrioritySelector value={priority} onChange={setPriority} />

      <Text style={styles.label}>期限（任意）</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={{ color: deadline ? Colors.textPrimary : Colors.textDisabled }}>
          {deadline ? deadline.toISOString().slice(0, 10) : '日付を選択'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={deadline ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(_, date) => {
            setShowPicker(Platform.OS === 'ios');
            if (date) setDeadline(date);
          }}
        />
      )}

      {deadline && (
        <TouchableOpacity onPress={() => setDeadline(null)}>
          <Text style={styles.clearDate}>期限をクリア</Text>
        </TouchableOpacity>
      )}

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
    borderWidth: 1, borderColor: Colors.border, justifyContent: 'center',
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  clearDate: { fontSize: 13, color: Colors.danger, marginTop: Spacing.xs },
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
