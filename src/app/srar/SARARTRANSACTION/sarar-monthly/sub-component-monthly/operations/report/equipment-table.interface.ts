
export interface HeaderColumn {
  label: string;
  rowspan?: number;
  colspan?: number;
  key?: string; // Key to map to data fields (supports nested paths like 'user.profile.name')
  source?: 'main' | 'nested'; // 'main' for root object, 'nested' for nested array items
  nestedArrayKey?: string; // Key of the nested array (e.g., 'shipDetails', 'employees', etc.)
  formatter?: (value: any) => string; // Optional formatter function
  cellClass?: string; // Optional CSS class for the cell
}

// Generic interface for any table data structure
export interface GenericTableData {
  [key: string]: any; 
}
