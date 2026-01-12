export interface FlightDTO {
  id?: number;                  
  flightNumber: string;  // required: The primary identifier (e.g., KQ001)
  
  // optional for "Quick Create"
  origin?: string;              
  destination?: string;         
  departureTime?: string;       
  
  checkedInSeats?: number;      
  boardedSeats?: number;        
  status?: string;              
  notes?: string;
}