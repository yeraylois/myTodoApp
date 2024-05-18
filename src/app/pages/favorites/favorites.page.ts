import { Component, OnInit, NgZone } from '@angular/core';
import { FirestoreService } from '../../core/services/firestore.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Task } from '../../core/models/task.model';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss']
})
export class FavoritesPage implements OnInit {
  tasks: Task[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private firestoreService: FirestoreService,
    private favoritesService: FavoritesService,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.authService.isAuthenticated$.pipe(take(1)).subscribe(isAuthenticated => {
        if (!isAuthenticated) {
          this.ngZone.run(() => {
            window.location.href = '/login';
          });
        } else {
          this.loadTasks();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadTasks() {
    this.subscription.add(
      this.firestoreService.getTasks().pipe(
        switchMap(firebaseTasks =>
          this.favoritesService.getFavorites().then(favoriteTasks => {
            return firebaseTasks.map(task => ({
              ...task,
              isFavorite: favoriteTasks.some(fav => fav.id === task.id)
            }));
          })
        )
      ).subscribe(tasks => {
        this.tasks = tasks;
      }, error => {
        console.error('Error loading tasks', error);
      })
    );
  }

  async toggleFavorite(task: Task) {
    if (task.isFavorite) {
      await this.favoritesService.removeFavorite(task.id);
    } else {
      await this.favoritesService.addFavorite(task);
    }
    this.loadTasks(); // Reload tasks to update the list
  }
}
