export interface Supplier {
  id?: number;
  code: string;
  name: string;
  address: string;
  area_street?: string;
  city: string;
  country: number;
  supplier_manufacture?: string;
  contact_person?: string;
  contact_number?: string;
  email_id?: string;
  active: 1 | 0;
}