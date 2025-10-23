export interface Department {
  id?: number; // Optional because it's not present when creating a new department
  active?: number | boolean;
  name: string;
  code: string;
  description: string;
  sfd_applicable?: number | boolean;
  created_by?: number;
}