import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonNote, IonBadge, IonButton, IonItemGroup } from '@ionic/angular/standalone';
import { FlightService } from 'src/app/services/flight-service';
import { Flight } from 'src/app/models/flight';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.page.html',
  styleUrls: ['./flights.page.scss'],
  standalone: true,
  imports: [IonItemGroup, IonButton, IonBadge, IonNote, IonLabel, IonIcon, IonItem, IonList, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FlightsPage implements OnInit {

private flightService = inject(FlightService);
private navCtrl = inject(NavController);
  
  
  flights: Flight[] = [];

  ionViewWillEnter() {
  this.flightService.getFlights().subscribe({
    next: (flights) => {
      // 'flights' is now the raw Flight[] array
      this.flights = flights || [];
    },
    error: (err) => {
      // The unwrap helper throws the backend 'message' here
      console.error('Error fetching flights:', err.message);
      // Optional: Show an Ionic Alert or Toast to the user here
    }
  });
}

  viewFlight(id: number) {
  this.navCtrl.navigateForward(['/flight-detail', id]);
}

goToCheckIn(flightId: number) {
  // Directs to the Week 2 "Fast-Entry" Portal
  this.navCtrl.navigateForward([`/check-in/${flightId}`]);
}

goToBoarding(flightId: number) {
  // Directs to the Week 3 "Gate App" / Detail View
  this.navCtrl.navigateForward([`/flight-detail/${flightId}`]);
}

getStatusColor(status: string): string {
  switch(status) {
    case 'CREATED': return 'primary';
    case 'BOARDING': return 'success';
    case 'CLOSED': return 'medium';
    default: return 'primary';
  }
}
  ngOnInit() {
  }

}
