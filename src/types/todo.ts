export type Priority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
