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
  private apiUrl = 'https://json-server-backend-en89.onrender.com/events';
  private usersUrl = 'https://json-server-backend-en89.onrender.com/users';
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

  getEventById(id: string): Observable<Event> {
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
    
    // Create new event without specifying ID (let JSON Server handle it)
    const newEvent = {
      ...event,
      organizer: currentUser.id,
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Post the new event
    return this.http.post<Event>(this.apiUrl, newEvent).pipe(
      tap(createdEvent => {
        const currentEvents = this.eventsSubject.value;
        this.eventsSubject.next([...currentEvents, createdEvent]);
      })
    );
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
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

  deleteEvent(id: string): Observable<void> {
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

  registerForEvent(eventId: string): Observable<User> {
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
    
    // Add event to user's registered events
    const updatedUser = {
      ...currentUser,
      registeredEvents: [...registeredEvents, eventId]
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

  unregisterFromEvent(eventId: string): Observable<User> {
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
    
    // Remove event from user's registered events
    const updatedUser = {
      ...currentUser,
      registeredEvents: registeredEvents.filter(id => id !== eventId)
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

  isUserRegistered(eventId: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.registeredEvents) {
      return false;
    }
    
    // Check if the user is registered for this event
    return currentUser.registeredEvents.includes(eventId);
  }
} 