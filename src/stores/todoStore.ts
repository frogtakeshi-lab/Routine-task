import { create } from 'zustand';
import { todoRepo } from '@/db/repositories/todoRepo';
import { generateId } from '@/utils/uuid';
import type { Todo } from '@/types/todo';

interface TodoState {
  todos: Todo[];
  isLoading: boolean;

  loadTodos: () => void;
  addTodo: (data: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, data: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  deleteTodo: (id: string) => void;
  toggleComplete: (id: string) => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  isLoading: false,

  loadTodos() {
    set({ isLoading: true });
    const todos = todoRepo.getAll();
    set({ todos, isLoading: false });
  },

  addTodo(data) {
    const now = new Date().toISOString();
    const todo: Todo = { id: generateId(), ...data, createdAt: now, updatedAt: now };
    todoRepo.insert(todo);
    set((s) => ({ todos: [todo, ...s.todos] }));
  },

  updateTodo(id, data) {
    todoRepo.update(id, data);
    set((s) => ({
      todos: s.todos.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deleteTodo(id) {
    todoRepo.delete(id);
    set((s) => ({ todos: s.todos.filter((t) => t.id !== id) }));
  },

  toggleComplete(id) {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;
    const now = new Date().toISOString();
    const data: Partial<Todo> = todo.isCompleted
      ? { isCompleted: false, completedAt: undefined }
      : { isCompleted: true, completedAt: now };
    todoRepo.update(id, data);
    set((s) => ({
      todos: s.todos.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: now } : t
      ),
    }));
  },
}));
