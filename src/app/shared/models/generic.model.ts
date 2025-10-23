// src/app/models/generic.model.ts
export interface Generic {
  id?: number;
  active?: number;
  sr_no: string;
  code: string;
  type: string;
  created_by?: number;
}