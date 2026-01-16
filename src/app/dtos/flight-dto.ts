export interface FlightDto {
  id?: number;                  
  flightNumber: string;         // Required: e.g., KQ001
  flightDate?: string;          // ISO Date string: YYYY-MM-DD (matches Java LocalDate)
  
  origin?: string;              
  destination?: string;         
  departureTime?: string | null; // ISO string for ZonedDateTime (can be null)

  /**
   * 🔑 INPUT FIELD: Must be sent to the backend during creation 
   * to generate sequences 1..N
   */
  highestSequence?: number;     
  
  // Read-only fields returned by the backend
  checkedInSeats?: number;      
  boardedSeats?: number;        
  status?: string;              
  notes?: string;
}