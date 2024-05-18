import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, deleteDoc, updateDoc, collectionData, DocumentReference } from '@angular/fire/firestore';
import { Task } from '../models/task.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  addTask(task: Omit<Task, 'id'>): Promise<DocumentReference> {
    const taskCollection = collection(this.firestore, 'tasks');
    const taskWithDate = { ...task, date: new Date() }; // Añadir la fecha de creación
    return addDoc(taskCollection, taskWithDate);
  }

  getTask(id: string): Observable<Task> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return from(getDoc(taskDoc)).pipe(
      map(doc => {
        return {
          id: doc.id,
          ...doc.data()
        } as Task;
      })
    );
  }

  getTasks(): Observable<Task[]> {
    const taskCollection = collection(this.firestore, 'tasks');
    return collectionData(taskCollection, { idField: 'id' }) as Observable<Task[]>;
  }

  updateTask(id: string, task: Partial<Task>): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return updateDoc(taskDoc, task);
  }

  deleteTask(id: string): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return deleteDoc(taskDoc);
  }
}
