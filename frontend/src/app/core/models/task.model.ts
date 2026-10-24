export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export interface Task { _id: string; title: string; description?: string; status: TaskStatus; priority: TaskPriority; dueDate?: string; tags: string[]; user: string; createdAt: string; updatedAt: string; completedAt?: string; }
export interface User { id: string; name: string; email: string; avatarColor?: string; }
export interface TaskStats { total: number; todo: number; inProgress: number; done: number; overdue: number; byPriority: Record<string, number>; }
