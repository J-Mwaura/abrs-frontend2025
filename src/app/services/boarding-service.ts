import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { BoardingSequence } from '../models/boarding-sequence';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dtos/reponse/api-response';

@Injectable({ providedIn: 'root' })
export class BoardingService {
  
  private baseUrl = environment.apiUrl + 'api/flights';
  private http = inject(HttpClient);

  // Check-in operations
  checkInPassenger(flightId: number, sequenceNumber: number) {
    return this.http.patch<ApiResponse<BoardingSequence>>(
      `${this.baseUrl}/${flightId}/sequences/${sequenceNumber}/check-in`,
      {} // Empty body, all data in URL
    ).pipe(map(res => this.unwrap(res)));
  }

  // Passenger status queries
  getExpectedPassengers(flightId: number) {
    return this.http.get<ApiResponse<BoardingSequence[]>>(`${this.baseUrl}/${flightId}/expected`)
      .pipe(map(res => this.unwrap(res)));
  }
   updateSequenceStatus(flightId: number, sequenceNumber: string, status: string) {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/${flightId}/sequences/${sequenceNumber}/status`, 
      { status }
    ).pipe(map(res => this.unwrap(res)));
  }

  // Status updates
  updatePassengerStatus(flightId: number, sequenceNumber: string, status: string) {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/${flightId}/sequences/${sequenceNumber}/status`, 
      { status }
    ).pipe(map(res => this.unwrap(res)));
  }

  // Boarding operation
  boardPassenger(flightId: number, sequenceNumber: number) {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/${flightId}/sequences/${sequenceNumber}/board`,
      {}
    ).pipe(map(res => this.unwrap(res)));
  }

  // Missing passengers
  // Matches @GetMapping("/{flightId}/missing")
  getMissingPassengers(flightId: number) {
    return this.http.get<ApiResponse<number[]>>(
      `${this.baseUrl}/${flightId}/missing`
    ).pipe(map(res => this.unwrap(res)));
  }

  // Note management
  // Matches @PostMapping("/{flightId}/sequences/{sequenceNumber}/note")
  addPassengerNote(flightId: number, sequenceNumber: number, note: string) {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/${flightId}/sequences/${sequenceNumber}/note`,
      { note } // Matches your BoardingNoteRequest DTO
    ).pipe(map(res => this.unwrap(res)));
  }

  private unwrap<T>(response: ApiResponse<T>): T {
    if (response.success) {
      return response.data!;
    } else {
      throw new Error(response.message || 'Server Error');
    }
  }
}