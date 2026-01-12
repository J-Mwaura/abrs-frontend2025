export enum BoardingStatus {
  EXPECTED = 'EXPECTED',
  CHECKED_IN = 'CHECKED_IN',
  BOARDED = 'BOARDED',
  MISSING = 'MISSING',
  CANCELLED = 'CANCELLED'
}

export interface BoardingSequence {
  id?: number;
  sequenceNumber: number; // Matches Integer in Java
  status: BoardingStatus; // Matches your Enumerated status
  note?: string;          // Optional because it's nullable in Java
  
  // To avoid circular JSON issues, we often just keep the flightId 
  // or make the full Flight object optional.
  flightId?: number; 
}