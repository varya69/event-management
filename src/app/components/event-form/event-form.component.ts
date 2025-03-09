import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../services/event.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  loading = false;
  isEditMode = false;
  eventId: string | null = null;
  
  categories = [
    'Conference', 'Workshop', 'Seminar', 'Networking', 
    'Social', 'Concert', 'Exhibition', 'Sports'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private eventService: EventService,
    private snackbarService: SnackbarService
  ) {
    this.eventForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      imageUrl: [''],
      price: [null],
      maxAttendees: [null]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.eventId = params['id'];
        if (this.eventId) {
          this.loadEvent(this.eventId);
        }
      }
    });
  }

  get f() { return this.eventForm.controls; }

  loadEvent(id: string): void {
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
          price: event.price,
          maxAttendees: event.maxAttendees
        });
        
        this.loading = false;
      },
      error => {
        this.snackbarService.error('Error loading event: ' + error.message);
        this.loading = false;
        this.router.navigate(['/events']);
      }
    );
  }

  suggestImageUrl(category: string): void {
    // Suggest an image URL based on the selected category
    const categoryImages: { [key: string]: string } = {
      'Conference': 'https://source.unsplash.com/random/800x600/?conference',
      'Workshop': 'https://source.unsplash.com/random/800x600/?workshop',
      'Seminar': 'https://source.unsplash.com/random/800x600/?seminar',
      'Networking': 'https://source.unsplash.com/random/800x600/?networking',
      'Social': 'https://source.unsplash.com/random/800x600/?social',
      'Concert': 'https://source.unsplash.com/random/800x600/?concert',
      'Exhibition': 'https://source.unsplash.com/random/800x600/?exhibition',
      'Sports': 'https://source.unsplash.com/random/800x600/?sports'
    };
    
    this.eventForm.patchValue({
      imageUrl: categoryImages[category] || 'https://source.unsplash.com/random/800x600/?event'
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
      this.snackbarService.warning('Please fill in all required fields correctly.');
      return;
    }
    
    this.loading = true;
    
    // Prepare event data
    const eventData = {
      ...this.eventForm.value,
      // Ensure date is properly formatted
      date: this.eventForm.value.date instanceof Date 
        ? this.eventForm.value.date 
        : new Date(this.eventForm.value.date)
    };
    
    if (this.isEditMode && this.eventId) {
      // Update existing event
      this.eventService.updateEvent(this.eventId, eventData).subscribe(
        updatedEvent => {
          this.snackbarService.success('Event updated successfully!');
          this.router.navigate(['/events', updatedEvent.id]);
        },
        error => {
          this.snackbarService.error('Error updating event: ' + error.message);
          this.loading = false;
        }
      );
    } else {
      // Create new event
      this.eventService.createEvent(eventData).subscribe(
        createdEvent => {
          this.snackbarService.success('Event created successfully!');
          this.router.navigate(['/events', createdEvent.id]);
        },
        error => {
          this.snackbarService.error('Error creating event: ' + error.message);
          this.loading = false;
        }
      );
    }
  }
} 