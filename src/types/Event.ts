import { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  name: string;
  type: 'Workout' | 'Event';
  date: string;
  time: string;
  description: string;
  instructor: string;
  location: string;
  subLocation: string;
  createdAt: Date;
  tags?: string;
  creatorEmail: string;
  creatorName?: string;
  creatorProfilePicture?: string;
  maxRSVPs?: number;
  attendees?: string[];
  additionalDetails?: string;
}

export interface EventWithTimestamp extends Omit<Event, 'createdAt'> {
  createdAt: Timestamp;
  id: string;
} 