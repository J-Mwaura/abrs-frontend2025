import { Component, Input } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
      </ion-toolbar>
    </ion-header>
  `
})
export class SharedHeaderComponent {
  @Input() title: string = '';
}