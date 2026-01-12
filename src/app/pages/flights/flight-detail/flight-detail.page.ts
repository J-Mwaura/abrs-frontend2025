import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonCard, IonBackButton, IonCardContent, IonBadge, IonList, IonListHeader, IonLabel, IonItemSliding, IonItem, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { FlightService } from 'src/app/services/flight-service';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { BoardingService } from 'src/app/services/boarding-service';



@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.page.html',
  styleUrls: ['./flight-detail.page.scss'],
  standalone: true,
  imports: [IonItemOption, IonItemOptions, IonItem, IonItemSliding, IonLabel, IonListHeader, IonList, IonBadge, IonCardContent, IonBackButton, IonCard, IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FlightDetailPage implements OnInit {
  flightId!: number;
  flight?: any;
  checkedInSequences: any[] = [];

  private route = inject(ActivatedRoute);
  private flightService = inject(FlightService);
  private boardingService = inject(BoardingService);

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);

  ngOnInit() {
    this.flightId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData() {
    this.flightService.getFlightById(this.flightId).subscribe(f => this.flight = f);
    this.boardingService.getExpectedPassengers(this.flightId).subscribe(s => this.checkedInSequences = s);
  }

  onBoard(sequence: any) {
    this.boardingService.updateSequenceStatus(this.flightId, sequence.sequenceNumber, 'BOARDED')
      .subscribe(() => {
        // Move to bottom logic or remove from list
        sequence.status = 'BOARDED';
        this.loadData(); // Refresh to update the list view
      });
  }

  async confirmClose() {
    // 1. Calculate stats
    // We assume you have the full sequence list or can derive it
    const totalCheckedIn = this.checkedInSequences.length;
    // In a real scenario, you'd likely track 'boardedCount' as a variable
    const boardedCount = this.flight.totalSequences - totalCheckedIn;

    const alert = await this.alertCtrl.create({
      header: 'Finalize Departure',
      subHeader: `Flight ${this.flight.flightNumber}`,
      message: `
      <div class="summary-container">
        <p><strong>Boarded:</strong> ${boardedCount} ✅</p>
        <p><strong>Missing:</strong> ${totalCheckedIn} ❌</p>
        <hr>
        <p>Are you sure you want to close this flight? This will mark all remaining passengers as MISSING.</p>
      </div>
    `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm Departure',
          handler: () => {
            this.executeFinalClose();
          }
        }
      ]
    });

    await alert.present();
  }

  private executeFinalClose() {
    this.flightService.closeFlight(this.flightId).subscribe({
      next: () => {
        // Navigate back to the main list after successful close
        this.navCtrl.navigateBack('/flights');
      },
      error: (err) => {
        console.error('Failed to close flight', err);
      }
    });
  }

}
