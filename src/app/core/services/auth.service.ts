// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private auth: Auth, private router: Router) {
    this.auth.onAuthStateChanged((user: User | null) => {
      console.log('Auth state changed:', !!user);
      this.isAuthenticatedSubject.next(!!user);
      if (!user) {
        this.router.navigate(['/login']).then(() => {
          console.log('User not authenticated, redirected to login');
        }).catch(err => {
          console.error('Navigation to login page failed', err);
        });
      }
    });
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    console.log('Login successful:', !!userCredential.user);
    this.isAuthenticatedSubject.next(!!userCredential.user);
    return userCredential;
  }

  async register(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    console.log('Registration successful:', !!userCredential.user);
    this.isAuthenticatedSubject.next(!!userCredential.user);
    return userCredential;
  }

  async logout() {
    await this.auth.signOut();
    console.log('Logout successful');
    this.isAuthenticatedSubject.next(false);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }
}
