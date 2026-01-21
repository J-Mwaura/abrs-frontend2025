import { Component } from '@angular/core';
import {
  IonApp } from '@ionic/angular/standalone';
import { MenuComponent } from './component/menu/menu.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
   standalone: true,
  imports: [
    MenuComponent,
    IonApp
]
})
export class AppComponent {

  constructor() {}
  
}
