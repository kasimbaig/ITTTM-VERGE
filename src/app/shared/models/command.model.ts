// src/app/models/command.model.ts

/**
 * Interface representing a Command record.
 * This model defines the structure for command data fetched from the API.
 */
export interface Command {
  id: number; // Unique identifier for the command
  active: number; // Status flag (e.g., 0 for inactive, 1 for active)
  name: string; // Name of the command (e.g., "Western Naval Command")
  code: string; // Code for the command (e.g., "Command_001")
  ref: string; // Reference for the command
  created_by: number | null; // ID of the user who created the record, can be null
}


