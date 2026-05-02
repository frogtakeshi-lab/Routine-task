import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { runMigrations } from '@/db/migrations';
import { useRoutineStore } from '@/stores/routineStore';
import { useTodoStore } from '@/stores/todoStore';
import { useUiStore } from '@/stores/uiStore';
import { todayString } from '@/utils/dateHelpers';

SplashScreen.preventAutoHideAsync();

export function useAppInit() {
  const loadRoutines = useRoutineStore((s) => s.loadRoutines);
  const loadCompletionsForRange = useRoutineStore((s) => s.loadCompletionsForRange);
  const loadTodos = useTodoStore((s) => s.loadTodos);
  const setReady = useUiStore((s) => s.setReady);

  useEffect(() => {
    try {
      runMigrations();
      loadRoutines();
      loadTodos();
      const today = todayString();
      loadCompletionsForRange(today, today);
    } catch (e) {
      console.error('App init error:', e);
    } finally {
      setReady(true);
      SplashScreen.hideAsync();
    }
  }, []);
}
