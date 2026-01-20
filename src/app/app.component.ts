import { Component, inject } from '@angular/core';
import { AuthService } from './security/services/auth-service';
import { Router } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenu, IonRouterOutlet } from '@ionic/angular/standalone';
import { MenuComponent } from './component/menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
   standalone: true,
  imports: [
    MenuComponent,
    IonApp]
})
export class AppComponent {

  constructor() {}
  
}
