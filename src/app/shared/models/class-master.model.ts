// src/app/models/class-master.model.ts

/**
 * Interface representing a Class Master record.
 * This model defines the structure for class master data fetched from the API.
 */
export interface ClassMaster {
  id: number; // Unique identifier for the class master
  active: number; // Status flag (e.g., 0 for inactive, 1 for active)
  code: string; // Code for the class (e.g., "Class_001")
  name: string; // Name of the class (e.g., "Class 1")
  created_on: string; // Creation timestamp
  created_ip: string; // IP address when created
  modified_on: string; // Last modification timestamp
  modified_ip: string | null; // IP address when last modified
  created_by: number; // User ID who created the record
  modified_by: number | null; // User ID who last modified the record
}
