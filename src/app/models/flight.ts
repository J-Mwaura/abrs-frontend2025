import { BoardingSequence } from './boarding-sequence';

export interface Flight {
  id?: number;
  flightNumber: string;
  flightDate: string;        // 🔑 Added to match Java (ISO Date string: YYYY-MM-DD)
  departureAirport: string; 
  arrivalAirport: string;
  departureTime?: string | null; // Made optional/nullable
  status: string;           
  sequences?: BoardingSequence[]; 
}