import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, User, onAuthStateChanged, deleteUser } from '@angular/fire/auth';
import { Firestore, doc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private auth: Auth, private firestore: Firestore, private ngZone: NgZone) {
    onAuthStateChanged(this.auth, (user: User | null) => {
      console.log('Auth state changed:', !!user);
      this.isAuthenticatedSubject.next(!!user);
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

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user);
      });
    });
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  getProfileData(): Observable<any> {
    return from(this.getCurrentUser()).pipe(
      switchMap(user => {
        if (user && user.uid) {
          const userDoc = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDoc)).pipe(
            switchMap(docSnapshot => {
              if (docSnapshot.exists()) {
                return of(docSnapshot.data());
              } else {
                return of(null);
              }
            })
          );
        } else {
          return of(null);
        }
      }),
      catchError(error => {
        console.error('Error fetching profile data', error);
        throw error;
      })
    );
  }

  async deleteAccount() {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = doc(this.firestore, `users/${user.uid}`);
      await deleteDoc(userDoc);
      await deleteUser(user);
    } else {
      throw new Error('No user is currently authenticated');
    }
  }
}
