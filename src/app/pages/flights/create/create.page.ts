import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlightDTO } from 'src/app/dtos/FlightDTO';
import { FlightService } from 'src/app/services/flight-service';
import {IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonText, IonNote, IonListHeader } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-flight',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: true, // Required for your current architecture
  imports: [
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
  recentFlights: FlightDTO[] = [];

  private flightService = inject(FlightService);

  constructor(
    private fb: FormBuilder,
    
  ) {
    this.flightForm = this.fb.group({
      flightNumber: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
        Validators.pattern('^[A-Za-z0-9]+$')
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
    this.flightForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (this.flightForm.invalid) {
      Object.keys(this.flightForm.controls).forEach(key => {
        this.flightForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const flightData: FlightDTO = {
      flightNumber: this.flightForm.get('flightNumber')?.value.toUpperCase().trim(),
      // Omit origin, destination, etc., so they are sent as undefined/null 
      // which aligns with your database "Quick Create" strategy.
    };

    this.flightService.createFlight(flightData as FlightDTO).subscribe({
      // 1. Allow 'response' to be FlightDTO or undefined
      next: (response?: FlightDTO) => {

        // 2. Add a check to ensure we have data
        if (response) {
          this.successMessage = `Flight ${response.flightNumber} created successfully! Status: ${response.status || 'CREATED'}`;
          this.clearForm();
          this.addToRecentFlights(response);
        } else {
          this.errorMessage = "Backend returned empty data.";
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Failed to create flight. Please try again.';
        console.error('Flight creation error:', error);
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

  private addToRecentFlights(flight: FlightDTO): void {
    // Add createdAt timestamp for display
    const flightWithTimestamp = {
      ...flight,
      createdAt: new Date().toISOString()
    };

    this.recentFlights = [flightWithTimestamp, ...this.recentFlights.slice(0, 4)];
    localStorage.setItem('recentFlights', JSON.stringify(this.recentFlights));
  }
}