// src/app/shared/models/ship-equipment-detail.model.ts
import { Ship } from '../../masters/ship-master/ship.model';
import { Section } from './section.model';
import { Group } from './group.model';
import { Country } from './country.model';
import { Supplier } from './supplier.model';
import { Equipment } from './equipment.model'; // Ensure this has 'code', 'name', 'nomenclature'


export interface ShipEquipmentDetail {
  id?: number;
  ship: Ship | number | any; // Allow any
  equipment: Equipment | number | any; // Allow any
  section: Section | number | any; // Allow any
  group: Group | number | any;     // Allow any
  country?: Country | number | any; // Optional and allow any
  supplier?: Supplier | number | any; // Optional and allow any
  model?: any; // Use Model interface, optional and allow null

  location_code: string;
  location_onboard: string;
  equipment_serial_no?: string | null;
  no_of_fits: number;

  // Add any other fields that might be part of the detail or form
  installation_date?: string | null; // Date string (YYYY-MM-DD), allow null
  removal_date?: string | null; // Date string (YYYY-MM-DD), allow null
  oem_part_number?: string | null;
  remarks?: string | null;
  active: 'Y' | 'N';
  created_by?: string;
  created_date?: string;

  // Derived properties for table display (not directly from API usually)
  shipNameDisplay?: string; // e.g., "P31 (INS KAVARATTI)"
  equipmentCodeName?: string; // This will be derived from equipment.code and equipment.name
  equipmentNomenclature?: string; // This will be derived from equipment.nomenclature
}