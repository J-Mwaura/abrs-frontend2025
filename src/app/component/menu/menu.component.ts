import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/security/services/auth-service';
import { Router } from '@angular/router';
import { IonMenu, IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon, IonRouterOutlet } from '@ionic/angular/standalone';
import { logOutOutline, logInOutline, airplaneOutline, settingsOutline, peopleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonRouterOutlet, IonMenu, IonContent, IonList, IonItem, IonLabel, IonIcon, CommonModule]
})
export class MenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    addIcons({
      'log-out-outline': logOutOutline,
      'log-in-outline': logInOutline,
      'airplane-outline': airplaneOutline,
      'settings-outline': settingsOutline,
      'people-outline': peopleOutline
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res) => {
        console.log(res.message || 'Logged out successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout failed', err);
        this.router.navigate(['/login']);
      }
    });
  }
}
