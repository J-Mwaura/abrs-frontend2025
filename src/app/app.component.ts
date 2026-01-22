import { Component } from '@angular/core';
import {
  IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { MenuComponent } from './component/menu/menu.component';
import { addIcons } from 'ionicons';
import { airplane, addCircleOutline, airplaneOutline, settings, trashOutline, people } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
   standalone: true,
  imports: [IonRouterOutlet, 
    MenuComponent,
    IonApp
]
})
export class AppComponent {

  constructor() {addIcons({ 
  airplane,              // Matches name="airplane"
  'add-circle-outline': addCircleOutline, // Matches name="add-circle-outline"
  airplaneOutline,
  settings,
  trashOutline,
  people
});}
  
}
