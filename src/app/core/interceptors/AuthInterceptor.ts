import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import {AuthService} from "../services/auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.isAuthenticated()) {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.authService.getCurrentUser()?.uid}`
        }
      });
      return next.handle(authReq).pipe(
        catchError(err => {
          if (err.status === 401 || err.status === 403) {
            this.router.navigate(['/login']);
          }
          throw err;
        })
      );
    }
    return next.handle(req);
  }
}
