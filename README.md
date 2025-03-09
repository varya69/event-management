# Event Management System
https://event-manager-f3c3f.web.app/events

A responsive event management application built with Angular and Angular Material, featuring user authentication, event creation, registration, and a modern UI with light/dark theme support. The project uses JSON Server as a backend and is deployed using Firebase.

![Event Management System](https://source.unsplash.com/random/800x400/?event)

## Live Demo

The application is deployed and available at:
- **Frontend**: https://event-manager-f3c3f.web.app/events
- **Backend API**: https://json-server-backend-en89.onrender.com

## Features

- **User Authentication**: Secure login and registration system
- **Role-Based Access Control**: Admin and regular user roles with different permissions
- **Event Management**: Create, view, edit, and delete events
- **Event Registration**: Users can register for events
- **My Events**: Users can view events they've registered for
- **Search Functionality**: Search events by title, location, category, or description
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Light/Dark Theme**: User-selectable theme with persistent preferences
- **Modern UI**: Clean, intuitive interface built with Angular Material

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- Angular CLI (v12 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/event-management.git
cd event-management
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Using the Deployed Backend

The application is configured to use the deployed backend at `https://json-server-backend-en89.onrender.com`. To run the application with this backend:

```bash
npm start
```

### Using a Local Backend (Development)

If you want to run the application with a local backend:

1. Install JSON Server globally:
```bash
npm install -g json-server
```

2. Update the API URLs in the following files to use localhost:
   - `src/app/services/event.service.ts`
   - `src/app/services/auth.service.ts`

3. Start the JSON Server:
```bash
json-server --watch db.json --port 3000
```

4. In a separate terminal, start the Angular application:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:4200`

## Default Users

The application comes with pre-configured users:

1. **Admin User**:
   - Email: admin@example.com
   - Password: password123
   - Role: Administrator (can create, edit, delete events)

2. **Regular User**:
   - Email: john@example.com
   - Password: password123
   - Role: User (can register for events)

## Project Structure

```
event-management/
├── src/
│   ├── app/
│   │   ├── components/         # Angular components
│   │   │   ├── event-detail/   # Event detail view
│   │   │   ├── event-form/     # Event creation/editing form
│   │   │   ├── event-list/     # Event listing page
│   │   │   ├── header/         # Application header
│   │   │   ├── login/          # Login page
│   │   │   └── register/       # Registration page
│   │   ├── guards/             # Route guards
│   │   │   └── auth.guard.ts   # Authentication guard
│   │   ├── models/             # Data models
│   │   │   ├── event.model.ts  # Event interface
│   │   │   └── user.model.ts   # User interface
│   │   ├── services/           # Services
│   │   │   ├── auth.service.ts # Authentication service
│   │   │   ├── event.service.ts# Event management service
│   │   │   └── theme.service.ts# Theme management service
│   │   ├── utils/              # Utility functions
│   │   │   └── db-normalizer.ts# Database ID normalizer
│   │   ├── material.module.ts  # Angular Material module
│   │   ├── app-routing.module.ts # Application routes
│   │   ├── app.component.ts    # Root component
│   │   └── app.module.ts       # Root module
│   ├── assets/                 # Static assets
│   ├── environments/           # Environment configurations
│   └── styles.css              # Global styles
├── db.json                     # Mock database for JSON Server
├── normalize-db.js             # Script to normalize database IDs
├── angular.json                # Angular configuration
├── package.json                # Project dependencies
└── README.md                   # Project documentation
```

## Key Design Decisions

### 1. Architecture

- **Component-Based Architecture**: The application is structured around reusable components, each with a specific responsibility.
- **Service Layer**: Services handle data fetching, state management, and business logic, keeping components focused on presentation.
- **Reactive Programming**: RxJS is used extensively for handling asynchronous operations and state management.
- **Lazy Loading**: Routes are configured for lazy loading to improve initial load time.

### 2. State Management

- **BehaviorSubject Pattern**: Services use BehaviorSubjects to maintain and share state across components.
- **Observable Data Services**: Components subscribe to observables from services to react to data changes.
- **Local Storage**: User preferences and authentication state are persisted in local storage.

### 3. Authentication & Authorization

- **JWT-like Authentication**: The application simulates JWT authentication with token storage.
- **Role-Based Access Control**: Different UI elements and routes are shown based on user roles.
- **Route Guards**: Protected routes use Angular Guards to prevent unauthorized access.

### 4. UI/UX Design

- **Material Design**: Angular Material provides a consistent and modern UI framework.
- **Responsive Layout**: Flexbox and CSS Grid ensure the application works on all device sizes.
- **Theme Support**: Light and dark themes with smooth transitions between them.
- **Accessibility**: High contrast ratios, keyboard navigation, and screen reader support.

### 5. Backend Integration

- **RESTful API**: The application communicates with the backend using RESTful principles.
- **JSON Server**: Provides a full REST API with minimal configuration.
- **Error Handling**: Comprehensive error handling for API requests with user feedback.
- **ID Normalization**: Ensures consistent numeric IDs for all events and references.

## Third-Party Libraries

- **Angular**: Core framework for building the application
- **Angular Material**: UI component library following Material Design guidelines
- **RxJS**: Reactive programming library for handling asynchronous operations
- **JSON Server**: REST API server for backend functionality
- **Firebase**: For hosting the frontend application
- **Render**: For hosting the JSON Server backend

## Development Workflow

### Adding New Features

1. Create necessary models in the `models` directory
2. Implement services in the `services` directory
3. Create components in the `components` directory
4. Update routing in `app-routing.module.ts`
5. Add any required Angular Material modules to `material.module.ts`

### Styling Guidelines

- Use CSS variables for theming (defined in `styles.css`)
- Component-specific styles should be in the component's CSS file
- Global styles should be in `styles.css`
- Use BEM naming convention for CSS classes

## Deployment

### Frontend Deployment

The frontend is deployed on Firebase. To deploy updates:

```bash
npm run build
firebase deploy
```

### Backend Deployment

The backend is deployed on Render using JSON Server. The database is hosted at:
`https://json-server-backend-en89.onrender.com`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## Acknowledgments

- Angular team for the amazing framework
- Angular Material team for the UI components
- JSON Server for the backend capabilities
- Firebase and Render for hosting services
