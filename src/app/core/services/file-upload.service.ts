import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(private storage: Storage) {}

  uploadFile(filePath: string, file: File): Observable<string> {
    const storageRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Observable(observer => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progress function...
        },
        (error) => {
          observer.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
            observer.next(downloadURL);
            observer.complete();
          }).catch(error => {
            observer.error(error);
          });
        }
      );
    });
  }
}
