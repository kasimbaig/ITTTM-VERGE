// src/app/shared/models/refit-cycle.model.ts

// Interface for a single RefitCycle
export interface RefitCycle {
  id: number;
  title: string;
  ship_name: string;
  ship_code: string;
  command_id: number;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
  refit_type: string; // e.g., 'Long Refit', 'Major Refit'
  location: string;
  progress_percentage: number;
  estimated_cost: number; // in millions INR
  crew_size: number;
  priority: 'High' | 'Medium' | 'Low';
  // These two properties were added in the service's mock data but not in the interface,
  // making them optional here to avoid breaking existing code that might not use them.
  // Ideally, they should be derived or part of the backend response if truly needed.
  type?: 'operational' | 'refit';
  status?: string; // 'progress', 'completed', 'pending'
  duration_days?: number; // Added to match the mock data in service
}

// Interface for summary data
export interface RefitSummary {
  total_refits: number;
  completed: number;
  in_progress: number;
  scheduled: number;
  total_estimated_cost: number; // Sum of estimated costs
  average_duration: number; // Average duration in days
}

// Interface for filters applied
export interface FiltersApplied {
  command_id: number | null;
  ship_id: number | null;
  start_date: string;
  end_date: string;
}

// Interface for refit types breakdown
export interface RefitTypesBreakdown {
  [key: string]: number; // e.g., { 'Long Refit': 5, 'Major Refit': 3 }
}

// Interface for the full API response structure
export interface RefitCyclesResponse {
  status: 'success' | 'error';
  message: string;
  status_code: number;
  data?: {
    refit_cycles: RefitCycle[];
    summary: RefitSummary; // <--- Added this
    filters_applied: FiltersApplied; // <--- Added this
    refit_types: RefitTypesBreakdown; // <--- Added this
    locations: string[]; // <--- Added this
  };
}
