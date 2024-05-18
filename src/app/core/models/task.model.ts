export interface Task {
  id: string;
  name: string;
  description: string;
  image: string | null;
  isFavorite: boolean;
  date: Date;  // Añadir esta propiedad
}
