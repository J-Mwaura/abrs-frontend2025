import { Component, EnvironmentInjector, inject, OnInit } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonItem, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { triangle, ellipse, square, settingsOutline, airplaneOutline, settings, trashOutline, people } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonToggle, IonItem, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage implements OnInit {
  public environmentInjector = inject(EnvironmentInjector);

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
}
