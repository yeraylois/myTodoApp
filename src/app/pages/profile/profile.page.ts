import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  profileData: any;
  showDeleteConfirmation: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getProfileData().subscribe(data => {
      if (data) {
        this.profileData = data;
      } else {
        console.error('User not logged in or no profile data available');
      }
    }, error => {
      console.error('Error fetching profile data', error);
    });
  }

  confirmDelete() {
    this.showDeleteConfirmation = true;
  }

  async deleteAccount() {
    try {
      await this.authService.deleteAccount();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error deleting account', error);
    }
  }

  cancelDelete() {
    this.showDeleteConfirmation = false;
  }
}
