export interface Event {
  id: string;
  type: string;
  instructor: string;
  date: Date;
  time: string;
  location: string;
  subLocation: string;
  maxRSVPs?: number;
} 