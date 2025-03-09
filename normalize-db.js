/**
 * Database Normalizer Runner
 * 
 * This script reads the db.json file, converts all string IDs to numbers,
 * and writes the normalized data back to db.json.
 */

const fs = require('fs');
const path = require('path');

// Path to db.json file
const DB_PATH = path.join(__dirname, 'db.json');

// Function to normalize the database
function normalizeDatabase() {
  console.log('Starting database normalization...');
  
  try {
    // Read the database file
    const dbContent = fs.readFileSync(DB_PATH, 'utf8');
    const db = JSON.parse(dbContent);
    
    // Process events - ensure IDs are numeric
    if (db.events && Array.isArray(db.events)) {
      console.log(`Processing ${db.events.length} events...`);
      
      db.events = db.events.map(event => {
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
          event.attendees = event.attendees.map(id => 
            typeof id === 'string' ? parseInt(id, 10) : id
          );
        }
        
        return event;
      });
    }
    
    // Process users - ensure registeredEvents are numeric
    if (db.users && Array.isArray(db.users)) {
      console.log(`Processing ${db.users.length} users...`);
      
      db.users = db.users.map(user => {
        // Convert registeredEvents IDs to numbers if they exist
        if (user.registeredEvents && Array.isArray(user.registeredEvents)) {
          user.registeredEvents = user.registeredEvents.map(id => 
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

console.log('To run this script, use: node normalize-db.js'); 