// src/app/models/ops-authority.model.ts

/**
 * Interface representing an Ops Authority record.
 * This model defines the structure for operational authority data fetched from the API.
 */
export interface OpsAuthority {
  id: number; // Unique identifier for the operational authority
  active: number; // Status flag (e.g., 0 for inactive, 1 for active)
  authority: string; // The authority's title or type (e.g., "Naval Command")
  code: string; // Code for the authority (e.g., "NC-001")
  name: string; // Name of the operational authority (e.g., "Naval Operations Authority")
  ops_order: string; // Operational order reference
  address: string; // Address of the authority
  created_by: number | null; // ID of the user who created the record, can be null
}

