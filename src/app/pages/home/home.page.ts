import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { Task } from '../../core/models/task.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  tasks: Task[] = [];
  private authSubscription!: Subscription;
  private tasksSubscription!: Subscription;
  sortAscending: boolean = true;

  faSort = faSort;
  faSortUp = faSortUp;
  faSortDown = faSortDown;

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadTasks();
      } else {
        window.location.href = '/login';
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }

  loadTasks() {
    this.tasksSubscription = this.firestoreService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.sortTasks();
    }, error => {
      console.error('Error loading tasks', error);
    });
  }

  toggleSortOrder() {
    this.sortAscending = !this.sortAscending;
    this.sortTasks();
  }

  sortTasks() {
    this.tasks.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
  }

  async toggleFavorite(task: Task, event: Event) {
    event.stopPropagation(); // Evita que el click en el icono también dispare el routerLink

    const updatedTask = { ...task, isFavorite: !task.isFavorite };
    if (task.id != null) {
      try {
        await this.firestoreService.updateTask(task.id, { isFavorite: updatedTask.isFavorite });
        task.isFavorite = updatedTask.isFavorite;
        console.log('Task updated');
      } catch (error) {
        console.error('Error updating task', error);
      }
    }
  }

  goToDetails(taskId: string) {
    window.location.href = `/detail/${taskId}`;
  }
}
