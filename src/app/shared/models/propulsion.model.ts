// src/app/models/propulsion.model.ts

/**
 * Interface representing a Propulsion record.
 * This model defines the structure for propulsion data fetched from the API.
 */
export interface Propulsion {
  id: number; // Unique identifier for the propulsion type
  active: number; // Status flag (e.g., 0 for inactive, 1 for active)
  name: string; // Name of the propulsion type (e.g., "Propulsion")
  created_by: number | null; // ID of the user who created the record, can be null
}
