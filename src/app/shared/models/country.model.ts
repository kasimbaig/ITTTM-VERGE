// src/app/shared/models/country.model.ts
export interface Country {
  id: number;
  name: string;
  code: string;
  active: 'Y' | 'N';
  created_by?: string; // Assuming this might be present based on other models
  created_date?: string; // Assuming this might be present
}