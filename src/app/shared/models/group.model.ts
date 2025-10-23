export interface Department {
  id: number;
  active: number;
  name: string;
  code: string;
  description: string;
  sfd_applicable: number;
  created_by: number;
}

export interface Section {
  id: number;
  department: Department;
  active: number;
  code: string;
  name: string;
  created_by: number;
}

export interface Generic {
  id: number;
  active: number;
  sr_no: string;
  code: string;
  type: string;
  created_by: number;
}

export interface Group {
  id?: number;
  section: Section | number | null;
  generic: Generic | number | null;
  active: number;
  code: string;
  name: string;
  created_by?: number;
}

export interface NewGroupFormData {
  code: string;
  name: string;
  section: number | null;
  generic: number | null;
  active?: number;
}