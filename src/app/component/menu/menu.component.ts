// menu.component.ts
import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/security/services/auth-service';
import { Router } from '@angular/router';
import { 
  IonMenu, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonIcon, 
  IonRouterOutlet ,
  IonMenuToggle,
  MenuController 
} from '@ionic/angular/standalone';
import { 
  logOutOutline, 
  logInOutline, 
  airplaneOutline, 
  settingsOutline, 
  peopleOutline 
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    IonRouterOutlet,
    IonMenu, 
    IonContent, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonIcon, 
    CommonModule, 
    IonMenuToggle,

  ]
})
export class MenuComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuController = inject(MenuController);

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

  async logout() {
    this.authService.logout().subscribe({
      next: async (res) => {
        console.log(res.message || 'Logged out successfully');
        await this.menuController.close(); // Close menu after logout
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        console.error('Logout failed', err);
        await this.menuController.close(); // Close menu even on error
        this.router.navigate(['/login']);
      }
    });
  }

  async goToTab(tab: string) {
    await this.menuController.close(); // Close menu after navigation
    this.router.navigate(['/tabs', tab], {
      replaceUrl: true
    });
  }
}