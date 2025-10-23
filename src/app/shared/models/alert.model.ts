
  // src/app/shared/models/alert.model.ts
  export interface DashboardAlert {
    id: number;
    type: 'Critical' | 'Warning' | 'Maintenance';
    message: string;
    timestamp: Date;
    status: string;
    equipmentId?: number; // For drill-down
    shipId?: number; // For drill-down
  }