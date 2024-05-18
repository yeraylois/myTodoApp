import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { FileUploadService } from '../../core/services/file-upload.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  downloadURL: string | null = null;
  loginErrorMessage: string | null = null;
  registerErrorMessage: string | null = null;
  fileName: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router,
    private fileUploadService: FileUploadService,
    private ngZone: NgZone // Inyectar NgZone
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      image: ['']
    });

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.ngZone.run(() => {
          this.router.navigate(['/home']).then(() => {
            console.log('User already logged in, redirected to home');
          });
        });
      }
    });
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const fileType = file.type.toLowerCase();

      if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') {
        this.selectedFile = file;
        this.fileName = file.name;
        this.registerErrorMessage = null;
      } else {
        this.selectedFile = null;
        this.fileName = null;
        this.registerErrorMessage = 'Solo se permiten archivos PNG, JPG y JPEG.';
        input.value = '';
      }
    } else {
      this.selectedFile = null;
      this.fileName = null;
      this.registerErrorMessage = null;
    }
  }

  changeFile() {
    this.selectedFile = null;
    this.fileName = null;
    this.registerErrorMessage = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  async loginUser() {
    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      this.ngZone.run(() => {
        this.router.navigate(['/home']);
      });
    } catch (error) {
      this.loginErrorMessage = 'Error iniciando sesión';
      console.error('Error iniciando sesión', error);
    }
  }

  async registerUser() {
    if (this.registerForm.invalid || this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.registerErrorMessage = 'Las contraseñas no coinciden';
      return;
    }

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
      this.registerErrorMessage = 'Error registrando usuario';
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
    this.ngZone.run(() => {
      this.router.navigate(['/home']);
    });
  }
}
