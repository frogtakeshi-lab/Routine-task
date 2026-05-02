import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, subDays, getDay, startOfWeek, endOfWeek } from 'date-fns';

export { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, subDays, getDay, startOfWeek, endOfWeek };

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayString(): string {
  return toDateString(new Date());
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

export function formatJapanese(date: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${format(date, 'M月d日')}(${days[getDay(date)]})`;
}
