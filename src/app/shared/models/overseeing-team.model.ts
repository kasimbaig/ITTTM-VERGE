// src/app/models/overseeing-team.model.ts

/**
 * Interface representing an Overseeing Team record.
 * This model defines the structure for overseeing team data fetched from the API.
 */
export interface OverseeingTeam {
  id: number; // Unique identifier for the overseeing team
  active: number; // Status flag (e.g., 0 for inactive, 1 for active)
  code: string; // Code for the overseeing team (e.g., "Team_001")
  name: string; // Name of the overseeing team (e.g., "Team 1 edit")
  created_by: string | null; // User who created the record, can be null
}

