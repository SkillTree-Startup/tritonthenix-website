import { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  additionalDetails?: string;
  tags?: string;
  type: 'Event' | 'Workout';
  maxRSVPs?: number;
  attendees?: string[];
  creatorName?: string;
  creatorProfilePicture?: string;
}

export interface EventWithTimestamp extends Omit<Event, 'createdAt'> {
  createdAt: Timestamp;
  id: string;
} 