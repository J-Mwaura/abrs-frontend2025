export interface FlightDTO {
  id?: number;                  // Optional for creation, present in response
  flightNumber: string;
  origin: string;               // Maps to departureAirport in Java
  destination: string;          // Maps to arrivalAirport in Java
  departureTime: string;        // Use ISO string (e.g., 2026-01-12T19:00:00Z)
  checkedInSeats?: number;      // Calculated by backend
  boardedSeats?: number;        // Calculated by backend
  status?: string;              // Created, Active, Completed, etc.
  notes?: string;
}