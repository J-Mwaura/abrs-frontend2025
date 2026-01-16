import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightService } from 'src/app/services/flight-service';
import {IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonText, IonListHeader, IonBadge } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FlightDto } from 'src/app/dtos/flight-dto';
@Component({
  selector: 'app-create-flight',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true, // Required for your current architecture
  imports: [IonBadge, 
    RouterLink,
    IonListHeader,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonList, IonItem, IonLabel, IonInput,
    IonButton, IonText, IonSpinner
]
})
export class CreatePage implements OnInit {
  flightForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  recentFlights: FlightDto[] = [];

  private flightService = inject(FlightService);

  constructor(private fb: FormBuilder) {
    this.flightForm = this.fb.group({
      flightNumber: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern('^[A-Za-z0-9]+$')
      ]],
      // 🔑 ADDED: highestSequence is required by your backend service
      highestSequence: [150, [
        Validators.required, 
        Validators.min(1), 
        Validators.max(500)
      ]]
    });
  }

  ngOnInit(): void {
    // Load recent flights from local storage or API if needed
    this.loadRecentFlights();
  }

  generateFlightNumber(): void {
    const airlines = ['KQ', 'AA', 'UA', 'DL', 'BA', 'LH', 'EK', 'SQ'];
    const randomAirline = airlines[Math.floor(Math.random() * airlines.length)];
    const randomNumber = Math.floor(100 + Math.random() * 900).toString().padStart(3, '0');
    const flightNumber = `${randomAirline}${randomNumber}`;

    this.flightForm.patchValue({ flightNumber });
  }

  clearForm(): void {
  this.flightForm.reset({
    highestSequence: 150 // 👈 Reset to default instead of null
  });
  this.errorMessage = '';
  this.successMessage = '';
}

 onSubmit(): void {
    if (this.flightForm.invalid) {
      this.flightForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // 🔑 ALIGNED: This object now matches what your Java createFlightWithSequences expects
    const flightData: FlightDto = {
      flightNumber: this.flightForm.get('flightNumber')?.value.toUpperCase().trim(),
      highestSequence: this.flightForm.get('highestSequence')?.value,
      departureTime: null, // As per your requirement to make it null for now
    };

    this.flightService.createFlight(flightData).subscribe({
      next: (response?: FlightDto) => {
        if (response) {
          // Success! response.flightDate will be "Today" thanks to your Mapper
          this.successMessage = `Flight ${response.flightNumber} initialized for ${response.flightDate} with ${flightData.highestSequence} sequences.`;
          this.clearForm();
          this.addToRecentFlights(response);
        } else {
          this.errorMessage = "Backend returned empty data.";
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        // This catches the RuntimeException (Duplicate) or IllegalArgumentException from Java
        this.errorMessage = error.message || 'Failed to create flight.';
        this.isLoading = false;
      }
    });
  }

  private loadRecentFlights(): void {
    // Could load from local storage or API
    const stored = localStorage.getItem('recentFlights');
    if (stored) {
      this.recentFlights = JSON.parse(stored);
    }
  }

  private addToRecentFlights(flight: FlightDto): void {
    // Add createdAt timestamp for display
    const flightWithTimestamp = {
      ...flight,
      createdAt: new Date().toISOString()
    };

    this.recentFlights = [flightWithTimestamp, ...this.recentFlights.slice(0, 4)];
    localStorage.setItem('recentFlights', JSON.stringify(this.recentFlights));
  }
}