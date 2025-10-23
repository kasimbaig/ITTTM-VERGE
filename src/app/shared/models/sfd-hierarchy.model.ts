// src/app/models/sfd-hierarchy.model.ts

/**
 * Interface representing an SFD Hierarchy record.
 * This model defines the structure for SFD hierarchy data fetched from the API.
 */
export interface SfdHierarchy {
  id: number; // Unique identifier for the SFD hierarchy
  active: number; // Status flag (e.g., 0 for inactive, 1 for active)
  name: string; // Name of the SFD hierarchy (e.g., "Hierarchy1")
  code: string; // Code for the SFD hierarchy (e.g., "INDIA")
  sfd_level: number; // SFD level
  h_code: string; // Hierarchy code
  created_by: number | null; // ID of the user who created the record, can be null
  parent: number | null; // ID of the parent hierarchy, can be null
}

