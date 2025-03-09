import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  loading = false;
  isEditMode = false;
  eventId: number | null = null;
  
  categories = [
    'Technology', 'Music', 'Sports', 'Food', 'Art', 'Business', 
    'Education', 'Health', 'Social', 'Other'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private snackBar: MatSnackBar
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      location: ['', [Validators.required]],
      category: ['', [Validators.required]],
      imageUrl: [''],
      maxAttendees: [null],
      price: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = +params['id'];
        this.loadEvent(this.eventId);
      }
    });

    // Listen for category changes to suggest image URLs
    this.eventForm.get('category')?.valueChanges.subscribe(category => {
      if (category && !this.eventForm.get('imageUrl')?.value) {
        this.suggestImageUrl(category);
      }
    });
  }

  get f() { return this.eventForm.controls; }

  loadEvent(id: number): void {
    this.loading = true;
    this.eventService.getEventById(id).subscribe(
      event => {
        // Convert date string to Date object for the datepicker
        const eventDate = new Date(event.date);
        
        this.eventForm.patchValue({
          title: event.title,
          description: event.description,
          date: eventDate,
          time: event.time,
          location: event.location,
          category: event.category,
          imageUrl: event.imageUrl,
          maxAttendees: event.maxAttendees,
          price: event.price
        });
        
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

  suggestImageUrl(category: string): void {
    // Get a random number between 1 and 30 for the image
    const randomImageNumber = Math.floor(Math.random() * 30) + 1;
    
    // Create a URL using dummyjson recipe images
    const suggestedUrl = `https://cdn.dummyjson.com/recipe-images/${randomImageNumber}.webp`;
    this.eventForm.get('imageUrl')?.setValue(suggestedUrl);
    
    this.snackBar.open('Image URL suggested for your event', 'Dismiss', {
      duration: 3000
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      return;
    }

    this.loading = true;
    
    const eventData = {
      ...this.eventForm.value,
      date: this.f.date.value instanceof Date 
        ? this.f.date.value.toISOString() 
        : new Date(this.f.date.value).toISOString()
    };

    if (this.isEditMode && this.eventId) {
      this.eventService.updateEvent(this.eventId, eventData).subscribe(
        () => {
          this.snackBar.open('Event updated successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/events', this.eventId]);
        },
        error => {
          this.snackBar.open('Error updating event: ' + error.message, 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      );
    } else {
      this.eventService.createEvent(eventData).subscribe(
        createdEvent => {
          this.snackBar.open('Event created successfully!', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/events', createdEvent.id]);
          // this.router.navigate(['/events']);
        },
        error => {
          this.snackBar.open('Error creating event: ' + error.message, 'Close', {
            duration: 3000
          });
          this.loading = false;
        }
      );
    }
  }
} 