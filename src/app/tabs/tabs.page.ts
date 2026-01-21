import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, settingsOutline, airplaneOutline, settings, trashOutline, people } from 'ionicons/icons';
import { AuthService } from '../security/services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);
  private authService = inject(AuthService);

  constructor() {
    addIcons({ 
      triangle, 
      ellipse, 
      square, 
      people,
      'add-circle-outline': ellipse, // Maps name="add-circle-outline" to the SVG data
      'moon-outline': triangle, // Maps name="moon-outline" to the SVG data
      'airplane': airplaneOutline, // Maps name="airplane" to the SVG data
      'settings': settings, // Maps name="settings" to the SVG data
      'settings-outline': settingsOutline,
      'trash-outline': trashOutline,
      'airplane-outline': airplaneOutline
    });
  }
  ngOnInit(): void {
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
  }

  toggleDarkMode(event: any) {
    const isDark = event.detail.checked;

    if (isDark) {
      document.documentElement.classList.add('ion-palette-dark');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}