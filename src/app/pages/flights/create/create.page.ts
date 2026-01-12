import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonToast } from '@ionic/angular/standalone';
import { FlightService } from 'src/app/services/flight-service';
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true,
  imports: [IonToast, IonButton, IonLabel, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CreatePage {
  
  private flightService = inject(FlightService);
  private navCtrl = inject(NavController);

 // Model matching your FlightDTO
  flight = {
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: new Date().toISOString()
  };

  showToast = false;
  toastMessage = '';


  submitFlight() {
    this.flightService.createFlight(this.flight).subscribe({
      next: (savedFlight) => {
        this.toastMessage = `Flight ${savedFlight?.flightNumber} created!`;
        this.showToast = true;
        // Redirect to the check-in page for the new flight
        setTimeout(() => this.navCtrl.navigateForward(['/check-in', savedFlight?.id]), 1500);
      },
      error: (err) => {
        this.toastMessage = "Error: " + err.message;
        this.showToast = true;
      }
    });
  }

}
