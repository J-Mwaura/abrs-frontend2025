import { BoardingSequence } from './boarding-sequence';

export interface Flight {
  id: number;
  flightNumber: string;
  // Renamed to match Java @Column names
  departureAirport: string; 
  arrivalAirport: string;
  departureTime: string; // ISO string from ZonedDateTime
  status: string;        // Or use an enum for better type safety
  
  // Added to match the OneToMany relationship in Java
  sequences?: BoardingSequence[]; 
  
  // Note: checkedInSeats and boardedSeats are missing in your Java Entity.
  // If you need them, you should add them to the Java class as well.
}