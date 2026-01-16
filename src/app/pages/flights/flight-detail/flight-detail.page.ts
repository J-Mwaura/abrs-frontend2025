import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonButton, IonButtons, IonCard, IonBackButton, IonCardContent, IonBadge, IonList, IonListHeader, IonLabel, IonItemSliding, IonItem, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { FlightService } from 'src/app/services/flight-service';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { BoardingService } from 'src/app/services/boarding-service';
import { FlightDto } from 'src/app/dtos/flight-dto';



@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.page.html',
  styleUrls: ['./flight-detail.page.scss'],
  standalone: true,
  imports: [IonItemOption, IonItemOptions, IonItem, IonItemSliding, IonLabel, IonListHeader, IonList, IonBadge, IonCardContent, IonBackButton, IonCard, IonButtons, IonButton, IonIcon, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class FlightDetailPage implements OnInit {
 flightId!: number;
  flight?: FlightDto; // 👈 Use the interface instead of any
  checkedInSequences: any[] = []; // This should ideally be BoardingSequenceDTO[]

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
    // 🔑 Ensure we use the flightDate field in the UI
    this.flightService.getFlightById(this.flightId).subscribe(f => {
      this.flight = f;
    });

    // Fetches only passengers with status 'EXPECTED'
    this.boardingService.getCheckedInPassengers(this.flightId).subscribe(s => {
      this.checkedInSequences = s;
    });
  }

  onBoard(sequence: any) {
  this.boardingService.updateSequenceStatus(this.flightId, sequence.sequenceNumber, 'BOARDED')
    .subscribe(() => {
      // 1. Remove the boarded passenger from the local "Expected" list immediately
      this.checkedInSequences = this.checkedInSequences.filter(s => s.sequenceNumber !== sequence.sequenceNumber);
      
      // 2. Increment the local boarded count so the header updates without a full reload
      if (this.flight && this.flight.boardedSeats !== undefined) {
        this.flight.boardedSeats++;
      }
    });
}

  async confirmClose() {
    // 🔑 Use highestSequence to match your Java DTO and Angular interface
    const totalCapacity = this.flight?.highestSequence || 0; 
    const remainingToBoard = this.checkedInSequences.length;
    const boardedCount = totalCapacity - remainingToBoard;

    const alert = await this.alertCtrl.create({
      header: 'Finalize Departure',
      subHeader: `Flight ${this.flight?.flightNumber}`,
      message: `
      <div class="summary-container">
        <p><strong>Boarded:</strong> ${boardedCount} ✅</p>
        <p><strong>Missing:</strong> ${remainingToBoard} ❌</p>
        <hr>
        <p>Are you sure you want to close this flight? This will mark all remaining passengers as MISSING.</p>
      </div>
    `,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm Departure',
          handler: () => { this.executeFinalClose(); }
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
