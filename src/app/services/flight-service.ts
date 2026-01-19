import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Flight } from '../models/flight';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../dtos/reponse/api-response';
import { map } from 'rxjs/operators';
import { FlightDto } from '../dtos/flight-dto';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlightService {

  private baseUrl = environment.apiUrl + 'api/flights';
  private http = inject(HttpClient);

  createFlight(flightData: Partial<FlightDto>) {
    return this.http.post<ApiResponse<FlightDto>>(this.baseUrl, flightData)
      .pipe(map(res => {
        if (res.success) return res.data;
        throw new Error(res.message);
      }));
  }

  // 1. Returns Flight[]
  getFlights() {
    return this.http.get<ApiResponse<Flight[]>>(this.baseUrl)
      .pipe(map(res => this.unwrap(res)));
  }

  // 2. Returns Flight
  getFlightById(flightId: number) {
    return this.http.get<ApiResponse<Flight>>(`${this.baseUrl}/${flightId}`)
      .pipe(map(res => this.unwrap(res)));
  }


  openBoarding(flightId: number) {
    return this.http.post<ApiResponse<FlightDto>>(`${this.baseUrl}/${flightId}/open`, {})
      .pipe(map(res => this.unwrap(res)));
  }

  // 5. Returns void
  closeFlight(flightId: number) {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${flightId}/close`, {})
      .pipe(map(res => this.unwrap(res)));
  }

  /**
   * Helper to handle the ApiResponse envelope consistently
   */
  private unwrap<T>(response: ApiResponse<T>): T {
    if (response.success) {
      // Adding the '!' tells TypeScript: "I trust that if success is true, data exists"
      return response.data!;
    } else {
      throw new Error(response.message || 'Server Error');
    }
  }

  getFlightStatus(flightId: number): Observable<string> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/${flightId}/status`)
      .pipe(map(res => this.unwrap(res)));
  }

  /**
     * Deletes a flight after manifest generation.
     * Expects a 200 OK with ApiResponse or 400/404 handled by interceptor.
     */
  deleteFlight(flightId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${flightId}`);
  }
}