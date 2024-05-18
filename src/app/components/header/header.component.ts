import { Component, OnInit, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from "../../core/services/auth.service";
import { MenuController } from "@ionic/angular";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  title: string = 'Tus Tareas';
  menuOpen: boolean = false;  // Variable para controlar la visibilidad del menú

  constructor(
    private authService: AuthService,
    private router: Router,
    private menu: MenuController, // Inyectar MenuController
    private ngZone: NgZone // Inyectar NgZone
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitle();
    });
  }

  updateTitle() {
    const url = this.router.url;
    if (url.includes('/profile')) {
      this.title = 'Perfil';
    } else if (url.includes('/favorites')) {
      this.title = 'Tareas Favoritas';
    } else if (url.includes('/add-task')) {
      this.title = 'Añadir Tarea';
    } else if (url.includes('/login')) {
      this.title = 'Login';
    } else {
      this.title = 'Tus Tareas';
    }
  }

  openMenu() {
    this.ngZone.run(() => {
      this.menu.open('user-menu');
    });
  }

  logout() {
    this.authService.logout();
    this.ngZone.run(() => {
      window.location.href = '/login';
      this.menu.close('user-menu');
    });
  }
}

/*el copilot */
