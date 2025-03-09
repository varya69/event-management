import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  loading = true;
  currentUser: User | null = null;
  isOrganizer = false;
  isAdmin = false;
  isRegistered = false;
  processingRegistration = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private authService: AuthService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'admin';
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadEvent(params['id']);
      } else {
        this.router.navigate(['/events']);
      }
    });
  }

  loadEvent(id: string): void {
    this.loading = true;
    this.eventService.getEventById(id).subscribe(
      event => {
        this.event = event;
        this.isOrganizer = this.currentUser?.id === event.organizer;
        this.isRegistered = this.eventService.isUserRegistered(id);
        this.loading = false;
      },
      error => {
        this.snackbarService.error('Error loading event: ' + error.message);
        this.loading = false;
        this.router.navigate(['/events']);
      }
    );
  }

  registerForEvent(): void {
    if (!this.event || !this.currentUser) return;
    
    this.processingRegistration = true;
    this.eventService.registerForEvent(this.event.id).subscribe(
      () => {
        this.isRegistered = true;
        this.snackbarService.success('Successfully registered for event!');
        this.processingRegistration = false;
      },
      error => {
        this.snackbarService.error('Error registering for event: ' + error.message);
        this.processingRegistration = false;
      }
    );
  }

  unregisterFromEvent(): void {
    if (!this.event || !this.currentUser) return;
    
    if (confirm('Are you sure you want to cancel your registration?')) {
      this.processingRegistration = true;
      this.eventService.unregisterFromEvent(this.event.id).subscribe(
        () => {
          this.isRegistered = false;
          this.snackbarService.success('Successfully unregistered from event');
          this.processingRegistration = false;
        },
        error => {
          this.snackbarService.error('Error unregistering from event: ' + error.message);
          this.processingRegistration = false;
        }
      );
    }
  }

  deleteEvent(): void {
    if (!this.event) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      this.loading = true;
      this.eventService.deleteEvent(this.event.id).subscribe(
        () => {
          this.snackbarService.success('Event deleted successfully!');
          this.router.navigate(['/events']);
        },
        error => {
          this.snackbarService.error('Error deleting event: ' + error.message);
          this.loading = false;
        }
      );
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/images/event-placeholder.jpg';
  }
} 