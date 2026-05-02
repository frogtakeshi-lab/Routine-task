import { create } from 'zustand';
import { routineRepo } from '@/db/repositories/routineRepo';
import { progressRepo } from '@/db/repositories/progressRepo';
import { isScheduledOn } from '@/utils/recurrence';
import { calculateStreak, calculateLongestStreak } from '@/utils/streak';
import { toDateString, todayString } from '@/utils/dateHelpers';
import { generateId } from '@/utils/uuid';
import type { Routine, RoutineCompletion } from '@/types/routine';

interface RoutineState {
  routines: Routine[];
  completions: Record<string, RoutineCompletion[]>;
  isLoading: boolean;

  loadRoutines: () => void;
  addRoutine: (data: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoutine: (id: string, data: Partial<Omit<Routine, 'id' | 'createdAt'>>) => void;
  deleteRoutine: (id: string) => void;
  toggleCompletion: (routineId: string, date: string) => void;
  loadCompletionsForRange: (start: string, end: string) => void;
}

export const useRoutineStore = create<RoutineState>((set, get) => ({
  routines: [],
  completions: {},
  isLoading: false,

  loadRoutines() {
    set({ isLoading: true });
    const routines = routineRepo.getAll();
    set({ routines, isLoading: false });
  },

  addRoutine(data) {
    const now = new Date().toISOString();
    const routine: Routine = { id: generateId(), ...data, createdAt: now, updatedAt: now };
    routineRepo.insert(routine);
    set((s) => ({ routines: [...s.routines, routine] }));
  },

  updateRoutine(id, data) {
    routineRepo.update(id, data);
    set((s) => ({
      routines: s.routines.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  deleteRoutine(id) {
    routineRepo.delete(id);
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
  },

  toggleCompletion(routineId, date) {
    const { completions, routines } = get();
    const dayCompletions = completions[date] ?? [];
    const existing = dayCompletions.find((c) => c.routineId === routineId);

    if (existing) {
      routineRepo.deleteCompletion(routineId, date);
      set((s) => ({
        completions: {
          ...s.completions,
          [date]: (s.completions[date] ?? []).filter((c) => c.routineId !== routineId),
        },
      }));
    } else {
      const completion: RoutineCompletion = {
        id: generateId(),
        routineId,
        completedDate: date,
        completedAt: new Date().toISOString(),
      };
      routineRepo.upsertCompletion(completion);
      set((s) => ({
        completions: {
          ...s.completions,
          [date]: [...(s.completions[date] ?? []), completion],
        },
      }));
    }

    // Recompute today's achievement
    const today = todayString();
    if (date === today) {
      const todayCompletions = get().completions[today] ?? [];
      const scheduled = routines.filter((r) => isScheduledOn(r, new Date()));
      const completedCount = todayCompletions.length + (existing ? 0 : 1) - (existing ? 1 : 0);
      const rate = scheduled.length > 0 ? completedCount / scheduled.length : 0;
      progressRepo.upsertDailyAchievement({
        date: today,
        scheduledRoutineCount: scheduled.length,
        completedRoutineCount: Math.min(completedCount, scheduled.length),
        completedTodoCount: 0,
        achievementRate: Math.min(rate, 1),
      });
    }
  },

  loadCompletionsForRange(start, end) {
    const list = routineRepo.getCompletionsForRange(start, end);
    const map: Record<string, RoutineCompletion[]> = {};
    for (const c of list) {
      if (!map[c.completedDate]) map[c.completedDate] = [];
      map[c.completedDate].push(c);
    }
    set((s) => ({ completions: { ...s.completions, ...map } }));
  },
}));

export function getTodayRoutines(state: RoutineState): Routine[] {
  const today = new Date();
  return state.routines.filter((r) => isScheduledOn(r, today));
}

export function getCompletedIds(state: RoutineState, date: string): Set<string> {
  return new Set((state.completions[date] ?? []).map((c) => c.routineId));
}

export function getStreakForRoutine(routineId: string): number {
  const completions = routineRepo.getCompletionsForRoutine(routineId);
  const routine = routineRepo.getById(routineId);
  if (!routine) return 0;
  const dates = new Set(completions.map((c) => c.completedDate));
  return calculateStreak(routine, dates);
}
