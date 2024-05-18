import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../core/services/firestore.service';
import { Task } from '../../core/models/task.model';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  task: Task | null = null;
  taskId!: string;
  private taskSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id')!;
    if (this.taskId) {
      this.loadTask();
    } else {
      console.error('Task ID is undefined');
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
  }

  loadTask() {
    this.taskSubscription = this.firestoreService.getTask(this.taskId).subscribe(task => {
      if (task) {
        this.task = task;
      } else {
        console.error('Task not found');
        this.router.navigate(['/home']);
      }
    }, error => {
      console.error('Error loading task', error);
    });
  }

  async deleteTask() {
    try {
      await this.firestoreService.deleteTask(this.taskId);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error deleting task', error);
    }
  }
}
