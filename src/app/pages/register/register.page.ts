import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FileUploadService } from '../../core/services/file-upload.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  downloadURL: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      image: ['']
    });

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/home']).then(() => {
          console.log('User already logged in, redirected to home');
        });
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
  }

  async registerUser() {
    const { name, lastName, email, password } = this.registerForm.value;
    try {
      const userCredential = await this.authService.register(email, password);
      const uid = userCredential.user?.uid;

      if (!uid) {
        throw new Error('User UID is undefined');
      }

      if (this.selectedFile) {
        const filePath = `users/${uid}/profile.jpg`;
        this.fileUploadService.uploadFile(filePath, this.selectedFile).subscribe(url => {
          this.downloadURL = url;
          this.saveUserData(uid, name, lastName, email, this.downloadURL);
        });
      } else {
        this.saveUserData(uid, name, lastName, email, null);
      }
    } catch (error) {
      console.error('Error registrando usuario', error);
    }
  }

  private async saveUserData(uid: string, name: string, lastName: string, email: string, imageUrl: string | null) {
    await setDoc(doc(this.firestore, `users/${uid}`), {
      name,
      lastName,
      email,
      image: imageUrl
    });
    this.router.navigate(['/favorites']);
  }
}
