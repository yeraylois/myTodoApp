import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore.service';
import { FileUploadService } from '../../core/services/file-upload.service';
import { Router } from '@angular/router';
import { Task } from '../../core/models/task.model';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.page.html',
  styleUrls: ['./add-task.page.scss'],
})
export class AddTaskPage implements OnInit, OnDestroy {
  taskForm: FormGroup;
  selectedFile: File | null = null;
  downloadURL: string | null = null;
  fileName: string | null = null;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private favoritesService: FavoritesService
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      isFavorite: [false]
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type.toLowerCase();

      if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') {
        this.selectedFile = file;
        this.fileName = file.name;
        this.errorMessage = null;
      } else {
        this.selectedFile = null;
        this.fileName = null;
        this.errorMessage = 'Solo se permiten archivos PNG, JPG y JPEG.';
        input.value = '';
      }
    } else {
      this.selectedFile = null;
      this.fileName = null;
      this.errorMessage = null;
    }
  }

  changeFile() {
    this.selectedFile = null;
    this.fileName = null;
    this.errorMessage = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async addTask() {
    if (this.taskForm.invalid || !this.selectedFile) {
      console.error('Form is invalid or no file selected');
      return;
    }

    const { name, description, isFavorite } = this.taskForm.value;
    const date = new Date(); // Añadir la fecha actual
    try {
      const docRef = await this.firestoreService.addTask({ name, description, image: null, isFavorite, date });
      const id = docRef.id;

      if (this.selectedFile) {
        const filePath = `tasks/${id}_${this.selectedFile.name}`;
        this.subscription.add(
          this.fileUploadService.uploadFile(filePath, this.selectedFile).subscribe(url => {
            this.downloadURL = url;
            this.saveTask(id, name, description, isFavorite, date, this.downloadURL);
          })
        );
      } else {
        await this.saveTask(id, name, description, isFavorite, date, null);
      }
    } catch (error) {
      console.error('Error adding task', error);
    }
  }

  private async saveTask(id: string, name: string, description: string, isFavorite: boolean, date: Date, imageUrl: string | null) {
    const task: Task = {
      id,
      name,
      description,
      image: imageUrl,
      isFavorite,
      date
    };

    await this.firestoreService.updateTask(id, task);

    if (isFavorite) {
      await this.favoritesService.addFavorite(task);
    }

    this.ngZone.run(() => {
      window.location.href = '/home';
    });
  }
}
