import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadEvent(+params['id']);
      } else {
        this.router.navigate(['/events']);
      }
    });
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getEventById(id).subscribe(
      event => {
        this.event = event;
        this.isOrganizer = this.currentUser?.id === event.organizer;
        this.isRegistered = this.eventService.isUserRegistered(id);
        this.loading = false;
      },
      error => {
        this.snackBar.open('Error loading event: ' + error.message, 'Close', {
          duration: 3000
        });
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
        this.snackBar.open('Successfully registered for event!', 'Close', {
          duration: 3000
        });
        this.processingRegistration = false;
      },
      error => {
        this.snackBar.open('Error registering for event: ' + error.message, 'Close', {
          duration: 3000
        });
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
          this.snackBar.open('Successfully unregistered from event', 'Close', {
            duration: 3000
          });
          this.processingRegistration = false;
        },
        error => {
          this.snackBar.open('Error unregistering from event: ' + error.message, 'Close', {
            duration: 3000
          });
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
          this.snackBar.open('Event deleted successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/events']);
        },
        error => {
          this.snackBar.open('Error deleting event: ' + error.message, 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      );
    }
  }

  handleImageError(event: any): void {
    // Replace broken image with a reliable placeholder
    const randomImageNumber = Math.floor(Math.random() * 30) + 1;
    event.target.src = `https://cdn.dummyjson.com/recipe-images/${randomImageNumber}.webp`;
  }
} 