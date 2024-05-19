import { Component, OnInit } from '@angular/core';
import { Task } from '../../core/models/task.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { FirestoreService } from '../../core/services/firestore.service'; // Importa FirestoreService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss']
})
export class FavoritesPage implements OnInit {
  favoriteTasks$: Observable<Task[]>;

  constructor(
    private favoritesService: FavoritesService,
    private firestoreService: FirestoreService // Inyecta FirestoreService
  ) {
    this.favoriteTasks$ = this.favoritesService.favorites$;
  }

  ngOnInit() {
    this.favoriteTasks$.subscribe(tasks => {
      // Puedes añadir lógica aquí si necesitas hacer algo cuando las tareas favoritas se actualizan.
    });
  }

  async toggleFavorite(task: Task, event: Event) {
    event.stopPropagation(); // Evita que el click en el icono dispare otros eventos
    if (!task.id) {
      console.error('Task ID es undefined');
      return;
    }

    try {
      // Cambiar el estado en Firestore
      const newFavoriteStatus = task.isFavorite;
      await this.firestoreService.updateTask(task.id, { isFavorite: newFavoriteStatus });
    } catch (error) {
      console.error('Error updating task favorite status', error);
    }
  }
}
