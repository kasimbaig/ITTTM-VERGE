// src/app/models/sfd-change-request.model.ts

import { Ship } from './ship.model'; // Assuming ship.model.ts exists
import { Unit } from './unit.model'; // Assuming unit.model.ts exists

export interface SfdChangeRequest {
  id?: number;
  unit_type: Unit | number | null; // Can be a Unit object or its ID
  ship_name: Ship | number | null; // Can be a Ship object or its ID
  equipment_name: string;
  location_code: string;
  location_on_board: string;
  no_of_fits: number;
  status: string; // e.g., 'Pending For Approval', 'Approved', 'Rejected'
  // Add any other fields as per your API response for SFD Change Request
  // For example, if there's a search field, you might need to consider what it maps to.
  remarks?: string;
}

// Re-using the Option interface from your existing code
export interface Option {
  label: string;
  value: number;
}