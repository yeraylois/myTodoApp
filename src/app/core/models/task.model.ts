// src/app/core/models/task.model.ts
export interface Task {
  id?: string;
  name: string;
  description: string;
  image: string | null;
  isFavorite: boolean;
}
