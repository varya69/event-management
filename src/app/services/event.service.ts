import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

export interface PaginatedEvents {
  events: Event[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/events';
  private usersUrl = 'http://localhost:3000/users';
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadEvents();
  }

  loadEvents(): void {
    this.http.get<Event[]>(this.apiUrl).subscribe(
      events => {
        this.eventsSubject.next(events);
      },
      error => {
        console.error('Error loading events:', error);
      }
    );
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEvents(): Observable<Event[]> {
    return this.events$;
  }

  getEventsPaginated(page: number = 1, limit: number = 6): Observable<PaginatedEvents> {
    // Calculate the starting index for pagination
    const startIndex = (page - 1) * limit;
    
    // Get all events first to calculate total
    return this.http.get<Event[]>(this.apiUrl).pipe(
      switchMap(allEvents => {
        const totalCount = allEvents.length;
        
        // Create params for pagination
        const params = new HttpParams()
          .set('_start', startIndex.toString())
          .set('_limit', limit.toString())
          .set('_sort', 'date')
          .set('_order', 'asc');
        
        // Get the paginated events
        return this.http.get<Event[]>(this.apiUrl, { params }).pipe(
          map(events => {
            return {
              events: events,
              total: totalCount,
              page: page,
              limit: limit
            };
          })
        );
      })
    );
  }

  getEventById(id: number | string): Observable<Event> {
    // Ensure id is treated as a string for the URL
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  getUserEvents(): Observable<Event[]> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return of([]);
    }
    
    if (currentUser.role === 'admin') {
      // For admin, show events they created
      return this.http.get<Event[]>(`${this.apiUrl}?organizer=${currentUser.id}`);
    } else {
      // For regular users, show events they registered for
      if (!currentUser.registeredEvents || currentUser.registeredEvents.length === 0) {
        return of([]);
      }
      
      // Get all events and filter client-side
      return this.getAllEvents().pipe(
        map(events => events.filter(event => 
          currentUser.registeredEvents?.includes(event.id as any)
        ))
      );
    }
  }

  searchEvents(query: string): Observable<Event[]> {
    if (!query.trim()) {
      return this.events$;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return this.events$.pipe(
      map(events => events.filter(event => 
        event.title.toLowerCase().includes(lowerQuery) ||
        event.location.toLowerCase().includes(lowerQuery) ||
        event.category.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery)
      ))
    );
  }

  createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Observable<Event> {
    const currentUser = this.authService.getCurrentUser();
    
    // Only admin can create events
    if (!currentUser || currentUser.role !== 'admin') {
      return throwError(() => new Error('Only administrators can create events'));
    }
    
    // First get all events to determine the next ID
    return this.getAllEvents().pipe(
      switchMap(events => {
        // Find the highest existing ID
        const maxId = events.reduce((max, event) => {
          const eventId = typeof event.id === 'string' ? parseInt(event.id, 10) : (event.id as number);
          return isNaN(eventId) ? max : Math.max(max, eventId);
        }, 0);
        
        // Create new event with numeric ID
        const newEvent = {
          ...event,
          id: maxId + 1, // Ensure ID is numeric and unique
          organizer: currentUser.id,
          attendees: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Post the new event with the specified ID
        return this.http.post<Event>(this.apiUrl, newEvent).pipe(
          tap(createdEvent => {
            const currentEvents = this.eventsSubject.value;
            this.eventsSubject.next([...currentEvents, createdEvent]);
          })
        );
      })
    );
  }

  updateEvent(id: number | string, event: Partial<Event>): Observable<Event> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return throwError(() => new Error('Only administrators can update events'));
    }
    
    // Ensure we don't change the ID type during update
    const updateData = {
      ...event,
      updatedAt: new Date()
    };
    
    // Delete id from update data if it exists to prevent ID changes
    if ('id' in updateData) {
      delete (updateData as any).id;
    }
    
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, updateData).pipe(
      tap(updatedEvent => {
        const currentEvents = this.eventsSubject.value;
        const index = currentEvents.findIndex(e => e.id === id);
        
        if (index !== -1) {
          const updatedEvents = [...currentEvents];
          updatedEvents[index] = updatedEvent;
          this.eventsSubject.next(updatedEvents);
        }
      })
    );
  }

  deleteEvent(id: number | string): Observable<void> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return throwError(() => new Error('Only administrators can delete events'));
    }
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentEvents = this.eventsSubject.value;
        this.eventsSubject.next(currentEvents.filter(event => event.id !== id));
      })
    );
  }

  registerForEvent(eventId: number | string): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError('User not authenticated');
    }
    
    // Check if user is already registered
    if (this.isUserRegistered(eventId)) {
      return throwError('Already registered for this event');
    }
    
    // Get current registered events or initialize empty array
    const registeredEvents = currentUser.registeredEvents || [];
    
    // Convert eventId to number for consistent storage
    const numericEventId = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
    
    // Add event to user's registered events
    const updatedUser = {
      ...currentUser,
      registeredEvents: [...registeredEvents, numericEventId]
    };
    
    // Update user in database
    return this.http.patch<User>(`${this.usersUrl}/${currentUser.id}`, {
      registeredEvents: updatedUser.registeredEvents
    }).pipe(
      tap(user => {
        // Update the current user in auth service
        this.authService.updateCurrentUser(user);
        
        // Update attendees list in the event
        this.getEventById(eventId).pipe(
          switchMap(event => {
            const attendees = event.attendees || [];
            return this.http.patch(`${this.apiUrl}/${eventId}`, {
              attendees: [...attendees, currentUser.id]
            });
          })
        ).subscribe();
      })
    );
  }

  unregisterFromEvent(eventId: number | string): Observable<User> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return throwError('User not authenticated');
    }
    
    // Get current registered events
    const registeredEvents = currentUser.registeredEvents || [];
    
    // Check if user is registered for this event
    if (!this.isUserRegistered(eventId)) {
      return throwError(() => {
        console.error('Not registered for event:', eventId);
        throw new Error('You are not registered for this event');
      });
    }
    
    // Convert eventId to number for consistent comparison
    const numericEventId = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
    
    // Remove event from user's registered events (ensuring numeric comparison)
    const updatedUser = {
      ...currentUser,
      registeredEvents: registeredEvents.filter(id => {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return numericId !== numericEventId;
      })
    };
    
    // Update user in database
    return this.http.patch<User>(`${this.usersUrl}/${currentUser.id}`, {
      registeredEvents: updatedUser.registeredEvents
    }).pipe(
      tap(user => {
        // Update the current user in auth service
        this.authService.updateCurrentUser(user);
        
        // Update attendees list in the event
        this.getEventById(eventId).pipe(
          switchMap(event => {
            const attendees = event.attendees || [];
            return this.http.patch(`${this.apiUrl}/${eventId}`, {
              attendees: attendees.filter(id => id !== currentUser.id)
            });
          })
        ).subscribe();
      })
    );
  }

  isUserRegistered(eventId: number | string): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.registeredEvents) {
      return false;
    }
    
    // Convert eventId to number if it's a string
    const numericEventId = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
    
    // Check if the user is registered for this event
    return currentUser.registeredEvents.some(id => {
      // Convert registered event ID to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      return numericId === numericEventId;
    });
  }
} 