import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonIcon, IonLabel, IonNote, IonBadge, IonButton, IonItemGroup, AlertController, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { FlightService } from 'src/app/services/flight-service';
import { Flight } from 'src/app/models/flight';
import { NavController } from '@ionic/angular';
import { ToastrService } from 'src/app/services/toast-service';
import { addIcons } from 'ionicons';
import { airplaneOutline, trashOutline, playOutline, eyeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.page.html',
  styleUrls: ['./flights.page.scss'],
  standalone: true,
  imports: [IonButtons, IonItemGroup, IonButton, IonBadge, IonNote, IonLabel,
    IonIcon, IonItem, IonList, IonContent, IonHeader, IonTitle,
    IonToolbar, CommonModule, FormsModule, IonMenuButton]
})
export class FlightsPage implements OnInit {

  constructor() {
    addIcons({
      'checkmark-done-circle-outline': airplaneOutline,
      'cloud-offline-outline': airplaneOutline,
      'airplane-outline': airplaneOutline,
      'trash-outline': trashOutline,
      'play-outline': playOutline,
      'eye-outline': eyeOutline
    });
  }

  private flightService = inject(FlightService);
  private navCtrl = inject(NavController);

  private alertController = inject(AlertController);
  private toast: ToastrService = inject(ToastrService);


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
    this.navCtrl.navigateForward(['/tabs/board', id]);
  }

  // Add this method to your FlightsPage class
  openFlightBoarding(flightId: number) {
    this.flightService.openBoarding(flightId).subscribe({
      next: (updatedFlight) => {
        // Once opened, navigate directly to the boarding board
        this.navCtrl.navigateForward(['/tabs/board', flightId]);
      },
      error: (err) => {
        console.error('Failed to open flight:', err.message);
        // You could add a toast here to inform the user
      }
    });
  }

  goToBoarding(flightId: number) {
    // Directs to the Week 3 "Gate App" / Detail View
    this.navCtrl.navigateForward([`/tabs/flight-detail/${flightId}`]);
  }

  async onDeleteFlight(flightId: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      subHeader: 'This action cannot be undone.',
      message: 'Are you sure you want to permanently delete this flight and all associated boarding records?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Delete cancelled');
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          cssClass: 'danger',
          handler: () => {
            this.executeDelete(flightId);
          }
        }
      ]
    });

    await alert.present();
  }

  private executeDelete(flightId: number) {
    this.flightService.deleteFlight(flightId).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'Flight removed successfully');
        // If you are already on the list page, you might just want to refresh:
        this.ionViewWillEnter();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Failed to delete flight';
        this.toast.error(errorMessage);
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CREATED': return 'primary';
      case 'BOARDING': return 'success';
      case 'CLOSED': return 'medium';
      case 'DELAYED': return 'warning';
      default: return 'primary';
    }
  }
  ngOnInit() {
  }

}
