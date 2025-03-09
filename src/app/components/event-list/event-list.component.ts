import { Component, OnInit, ViewChild } from '@angular/core';
import { EventService, PaginatedEvents } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Event } from '../../models/event.model';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { PageEvent, MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  events$: Observable<Event[]>;
  filteredEvents$ = new BehaviorSubject<Event[]>([]);
  allEvents: Event[] = [];
  searchControl = new FormControl('');
  loading = true;
  isMyEventsView = false;
  isAdmin = false;
  pageTitle = 'All Events';
  isDarkMode$: Observable<boolean>;
  isSearching = false;

  // Pagination properties
  totalEvents = 0;
  pageSize = 6;
  currentPage = 1;
  pageSizeOptions = [6, 12, 24, 48];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService
  ) {
    this.events$ = this.filteredEvents$.asObservable();
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit(): void {
    // Check if this is the "My Events" view
    this.route.data.subscribe(data => {
      this.isMyEventsView = data['myEvents'] === true;
      this.pageTitle = this.isMyEventsView ? 'My Events' : 'All Events';
    });
    
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';
    
    // Load events based on view type
    if (this.isMyEventsView) {
      this.loadMyEvents();
    } else {
      this.loadPaginatedEvents();
    }
    
    // Set up search functionality
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => {
        if (value) {
          this.isSearching = true;
        } else {
          this.isSearching = false;
          if (!this.isMyEventsView) {
            this.loadPaginatedEvents();
          }
        }
      }),
      switchMap(value => {
        this.loading = true;
        if (!value) {
          return of([]);
        }
        return this.eventService.searchEvents(value);
      }),
      tap(() => this.loading = false)
    ).subscribe(events => {
      if (this.isSearching) {
        this.filteredEvents$.next(events);
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPaginatedEvents();
  }

  private loadPaginatedEvents(): void {
    this.loading = true;
    this.eventService.getEventsPaginated(this.currentPage, this.pageSize).subscribe(
      (response: PaginatedEvents) => {
        this.filteredEvents$.next(response.events);
        this.totalEvents = response.total;
        this.loading = false;
      },
      error => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    );
  }

  private loadMyEvents(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.eventService.getEvents().subscribe(
      events => {
        let filteredEvents: Event[];
        
        if (this.isAdmin) {
          // For admin, show events they created
          filteredEvents = events.filter(event => event.organizer === currentUser.id);
        } else {
          // For regular users, show events they registered for
          const registeredEventIds = currentUser.registeredEvents || [];
          filteredEvents = events.filter(event => registeredEventIds.includes(event.id as any));
        }
        
        this.filteredEvents$.next(filteredEvents);
        this.loading = false;
      },
      error => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    );
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.isSearching = false;
    if (!this.isMyEventsView) {
      this.loadPaginatedEvents();
    } else {
      this.loadMyEvents();
    }
  }

  isUserRegistered(eventId: number | string): boolean {
    return this.eventService.isUserRegistered(eventId);
  }

  handleImageError(event: any): void {
    // Replace broken image with a reliable placeholder
    const randomImageNumber = Math.floor(Math.random() * 30) + 1;
    event.target.src = `https://cdn.dummyjson.com/recipe-images/${randomImageNumber}.webp`;
  }
} 