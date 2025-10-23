// src/app/masters/ship-master/ship.model.ts

export interface Ship {
  id?: number;
  sr_no: string;
  code: string;
  name: string;
  unit_type:number | { id: number; name: string } | any;
  ship_category: number | { id: number; name: string } | any; // ID or nested object or null
  sfd_hierarchy: number | { id: number; name: string } | null;
  class_master: number | { id: number; name: string } | null;
  class_code: string;
  commission_date: string;
  command: number | { id: number; name: string } | null;
  authority: number | { id: number; name: string } | null;
  ops_code: string;
  ship_builder: string;
  decommission_date: string;
  displacement: string;
  hours_underway: number;
  distance_run: number;
  decommission_scheduled_date: string;
  propulsion: number | { id: number; name: string } | null;
  sdrsref: string;
  yard_no: string;
  reference_no: string;
  classification_society: string;
  length_overall: string;
  length_perpen: string;
  module_breath: string;
  wetted_under_water: string;
  depth_main: string;
  standard_disp: string;
  full_load_disp: string;
  stand_draft: string;
  full_load_draft: string;
  wetted_boot_top: string;
  engine_rating: string;
  max_cont_speed: string;
  eco_speed: string;
  endurance: string;
  remark: string;
  refit_authority: string;
  signal_name: string;
  address: string;
  contact_number: string;
  nud_email_id: string;
  nic_email_id: string;
  overseeing_team: number | { id: number; name: string } | null;
  active?: number | boolean | any; // Keep as number for backend (0/1), and optional for Partial<Ship>
  created_by?: number;
}
/**
 * Generic interface for dropdown options.
 * Used to standardize data for PrimeNG dropdown components.
 * This can be placed in a shared models file if it's used across multiple models.
 */
export interface Option {
  label: string | any; // The text displayed in the dropdown
  value: number | string | any; // The actual value associated with the option (typically the ID)
  commandId?: any;
  shipId?:any
}