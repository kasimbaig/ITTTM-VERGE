

export interface SfdEquipment {
  id?: number;
  // Properties that can be full objects or just their IDs
  equipment?: { id: number; code_name?: string; nomenclature?: string } | number;
  sfd_hierarchy?: number;
  ship?: { id: number; name?: string } | number;
  supplier?: { id: number; name?: string } | number;
  manufacturer?: { id: number; name?: string } | number;
  sfd_group?: { id: number; name?: string } | number; // Corresponds to department
  parent_equipment?: { id: number; code_name?: string; nomenclature?: string } | number | null;

  // Properties that are direct values (snake_case to match API payload)
  location_code: string;
  location_onboard: string;
  no_of_fits: number;
  oem_part_number?: string;
  installation_date: string; // ISO date string (YYYY-MM-DD)
  removal_date?: string | null; // ISO date string or null
  remarks?: string;
  model?: string;
  equipment_serial_no?: string;
  service_life?: string; // Or number, depending on type
  to_be_included_in_dl?: 'Y' | 'N'; // For checkbox
  active?: any; // Active status

  // Derived properties for display in the table (not part of the API payload for add/edit)
  equipmentCodeName?: string;
  nomenclature?: string; // This can also be a direct property if the API sends it directly, otherwise derived.
}