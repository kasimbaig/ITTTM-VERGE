export interface ShipCategory {
  id?: number;
  active?: number | boolean;
  name: string;
  code: string;
  description?: string;
  created_by: string | null; // User who created the record, can be null
}

