export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: number; // User ID of the organizer
  attendees?: number[]; // Array of User IDs
  imageUrl?: string;
  category: string;
  maxAttendees?: number;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
} 