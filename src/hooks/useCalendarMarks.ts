import { useMemo } from 'react';
import { eachDayOfInterval, startOfMonth, endOfMonth, format } from 'date-fns';
import { useRoutineStore } from '@/stores/routineStore';
import { useTodoStore } from '@/stores/todoStore';
import { isScheduledOn } from '@/utils/recurrence';

export function useCalendarMarks(visibleMonth: Date) {
  const routines = useRoutineStore((s) => s.routines);
  const completions = useRoutineStore((s) => s.completions);
  const todos = useTodoStore((s) => s.todos);

  return useMemo(() => {
    const start = startOfMonth(visibleMonth);
    const end = endOfMonth(visibleMonth);
    const days = eachDayOfInterval({ start, end });
    const marked: Record<string, { dots: { key: string; color: string }[] }> = {};

    for (const day of days) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dots: { key: string; color: string }[] = [];

      const scheduledRoutines = routines.filter((r) => isScheduledOn(r, day));
      const dayCompletions = completions[dateStr] ?? [];
      const completedIds = new Set(dayCompletions.map((c) => c.routineId));

      for (const r of scheduledRoutines.slice(0, 3)) {
        dots.push({
          key: r.id,
          color: completedIds.has(r.id) ? r.colorTag : '#CBD5E1',
        });
      }

      const hasIncompleteTodo = todos.some(
        (t) => t.deadline === dateStr && !t.isCompleted
      );
      if (hasIncompleteTodo) {
        dots.push({ key: 'todo', color: '#9CA3AF' });
      }

      if (dots.length > 0) {
        marked[dateStr] = { dots };
      }
    }
    return marked;
  }, [visibleMonth, routines, completions, todos]);
}
