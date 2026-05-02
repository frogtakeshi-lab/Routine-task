import { create } from 'zustand';
import { todayString } from '@/utils/dateHelpers';

interface UiState {
  isReady: boolean;
  selectedDate: string;
  setReady: (ready: boolean) => void;
  setSelectedDate: (date: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isReady: false,
  selectedDate: todayString(),
  setReady: (ready) => set({ isReady: ready }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
