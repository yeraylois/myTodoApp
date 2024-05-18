import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  addTask(task: Omit<Task, 'id'>) {
    const taskCollection = collection(this.firestore, 'tasks');
    return addDoc(taskCollection, task);
  }

  getTask(id: string) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return getDoc(taskDoc);
  }

  getTasks() {
    const taskCollection = collection(this.firestore, 'tasks');
    return getDocs(taskCollection);
  }

  updateTask(id: string, task: Partial<Task>) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return updateDoc(taskDoc, task);
  }

  deleteTask(id: string) {
    const taskDoc = doc(this.firestore, `tasks/${id}`);
    return deleteDoc(taskDoc);
  }
}
