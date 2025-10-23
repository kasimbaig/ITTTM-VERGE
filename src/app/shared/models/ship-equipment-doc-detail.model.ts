import { Ship } from '../../masters/ship-master/ship.model'; // Assuming Ship model
import { Equipment } from './equipment.model';
import { Manufacturer } from './manufacturer.model';
import { Supplier } from './supplier.model';

export interface ShipEquipmentDocDetail {
  id?: number; // Optional for new records
  ship: number | Ship; // Can be ID for payload or full object for display
  equipment: number | Equipment; // Can be ID for payload or full object for display
  location_code: string;
  location_onboard: string;
  reference_no: string;
  category: string;
  description: string;
  manufacturer: number | Manufacturer; // Can be ID for payload or full object for display
  supplier: number | Supplier; // Can be ID for payload or full object for display

  // Enriched properties for display (populated in the component)
  shipNameDisplay?: string; // e.g., "Ship A - IMO 1234567"
  equipmentCodeName?: string; // e.g., "EQ001 - Pump X"
  equipmentNomenclature?: string;
  manufacturerName?: string;
  supplierName?: string;
}