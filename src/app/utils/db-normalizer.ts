/**
 * Database Normalizer Utility
 * 
 * This script normalizes the db.json file to ensure all IDs are numeric.
 * Run this script using: 
 * 
 * 1. Add to package.json scripts:
 *    "normalize-db": "ts-node src/app/utils/db-normalizer.ts"
 * 
 * 2. Run: npm run normalize-db
 */

import * as fs from 'fs';
import * as path from 'path';

// Define interfaces for database structure
interface Event {
  id: number | string;
  title: string;
  attendees?: (number | string)[];
  [key: string]: any;
}

interface User {
  id: number;
  registeredEvents?: (number | string)[];
  [key: string]: any;
}

interface Database {
  events?: Event[];
  users?: User[];
  [key: string]: any;
}

// Path to db.json file (adjust as needed)
const DB_PATH = path.join(process.cwd(), 'db.json');

// Function to normalize the database
function normalizeDatabase() {
  console.log('Starting database normalization...');
  
  try {
    // Read the database file
    const dbContent = fs.readFileSync(DB_PATH, 'utf8');
    const db: Database = JSON.parse(dbContent);
    
    // Process events - ensure IDs are numeric
    if (db.events && Array.isArray(db.events)) {
      console.log(`Processing ${db.events.length} events...`);
      
      db.events = db.events.map((event: Event) => {
        // Convert ID to number if it's a string
        if (typeof event.id === 'string') {
          const numericId = parseInt(event.id, 10);
          if (!isNaN(numericId)) {
            console.log(`Converting event ID from "${event.id}" to ${numericId}`);
            event.id = numericId;
          }
        }
        
        // Also convert attendees IDs to numbers if they exist
        if (event.attendees && Array.isArray(event.attendees)) {
          event.attendees = event.attendees.map((id: number | string) => 
            typeof id === 'string' ? parseInt(id, 10) : id
          );
        }
        
        return event;
      });
    }
    
    // Process users - ensure registeredEvents are numeric
    if (db.users && Array.isArray(db.users)) {
      console.log(`Processing ${db.users.length} users...`);
      
      db.users = db.users.map((user: User) => {
        // Convert registeredEvents IDs to numbers if they exist
        if (user.registeredEvents && Array.isArray(user.registeredEvents)) {
          user.registeredEvents = user.registeredEvents.map((id: number | string) => 
            typeof id === 'string' ? parseInt(id, 10) : id
          );
        }
        
        return user;
      });
    }
    
    // Write the normalized database back to the file
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
    console.log('Database normalization completed successfully!');
    
  } catch (error) {
    console.error('Error normalizing database:', error);
  }
}

// Run the normalization
normalizeDatabase(); 