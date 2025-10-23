// import { Injectable } from '@angular/core';
// import { BehaviorSubject, catchError, finalize, map, Observable, of, tap, throwError } from 'rxjs';
// import { ApiService } from '../../../services/api.service';
// // Define interfaces for your API response and transformed data
// export interface EquipmentDartCount {
//   equipment_id: number;
//   equipment_name: string;
//   dart_count: number;
// }

// export interface DefectListApiResponse {
//   status: string;
//   message: string;
//   data: {
//     equipment_dart_counts: EquipmentDartCount[];
//     total_equipments: number;
//     total_darts: number;
//     filters_applied: {
//       command_id: string | null;
//       ship_id: string | null;
//       department_id: string | null;
//       // Add date range properties if your API supports them in the filters_applied object
//     };
//   };
//   status_code: number;
// }

// // Chart data structure for PrimeNG Chart
// export interface ChartData {
//   labels: string[];
//   datasets: {
//     label: string;
//     backgroundColor: string;
//     data: number[];
//   }[];
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class DefectListService {
//  // The endpoint specific to this service, relative to the base apiUrl in ApiService
//   private defectListEndpoint = 'dart/defect-list/';

//   // A BehaviorSubject to hold and emit the current loading state
//   private _loading = new BehaviorSubject<boolean>(false);
//   readonly loading$ = this._loading.asObservable();

//   // Inject your generic ApiService
//   constructor(private apiService: ApiService) { }

//   /**
//    * Fetches defect counts based on provided filters.
//    * @param commandId Optional command ID.
//    * @param departmentId Optional department ID.
//    * @param shipId Optional ship ID.
//    * @param startDate Optional start date for range filtering.
//    * @param endDate Optional end date for range filtering.
//    * @returns An Observable of the transformed ChartData.
//    */
//   getDefectCounts(
//     commandId: string | null,
//     departmentId: string | null,
//     shipId: string | null,
//     startDate?: Date,
//     endDate?: Date
//   ): Observable<ChartData> {
//     this._loading.next(true); // Set loading to true

//     const params: { [key: string]: any } = {};
//     if (commandId) {
//       params['command_id'] = commandId;
//     }
//     if (departmentId) {
//       params['department_id'] = departmentId;
//     }
//     if (shipId) {
//       params['ship_id'] = shipId;
//     }
//     if (startDate) {
//       // Assuming API expects YYYY-MM-DD or similar. Adjust format as needed.
//       params['start_date'] = startDate.toISOString().split('T')[0];
//     }
//     if (endDate) {
//       params['end_date'] = endDate.toISOString().split('T')[0];
//     }

//     // Use apiService.get method here
//     return this.apiService.get<DefectListApiResponse>(this.defectListEndpoint, params).pipe(
//       map(response => this.transformApiResponseToChartData(response)),
//       // The handleError is now handled by ApiService, but we keep a catchError here
//       // to transform the error into an empty chart data for the UI
//       catchError(error => {
//         console.error('Error fetching defect data in DartService:', error);
//         this._loading.next(false); // Ensure loading is turned off on error
//         // Return an empty ChartData object or a default error state
//         return of({ labels: [], datasets: [{ label: 'Error Loading Data', backgroundColor: '#ef4444', data: [] }] });
//         // Or rethrow the error if you want a global error handler to catch it
//         // return throwError(() => error);
//       }),
//       finalize(() => this._loading.next(false)) // Ensure loading is turned off after success or final error
//     );
//   }

//   /**
//    * Transforms the raw API response into the format suitable for PrimeNG charts.
//    * @param response The API response object.
//    * @returns ChartData object.
//    */
//   private transformApiResponseToChartData(response: DefectListApiResponse): ChartData {
//     if (response.status !== 'success' || !response.data || !response.data.equipment_dart_counts) {
//       // Handle cases where API indicates failure or malformed data
//       console.warn('API response indicates an issue or missing data in transformApiResponseToChartData:', response);
//       // Return a default empty chart data set
//       return { labels: [], datasets: [] };
//     }

//     const labels = response.data.equipment_dart_counts.map(item => item.equipment_name);
//     const data = response.data.equipment_dart_counts.map(item => item.dart_count);

//     const shipLabel = response.data.filters_applied.ship_id
//       ? `Ship ID ${response.data.filters_applied.ship_id}` // You might want to map ship_id to ship_name here if you have that data
//       : 'All Ships';

//     return {
//       labels: labels,
//       datasets: [
//         {
//           label: `${shipLabel} - Defects`,
//           backgroundColor: '#42A5F5', // You can make this dynamic based on criteria
//           data: data
//         }
//       ]
//     };
//   }
// }
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, tap, throwError } from 'rxjs';
import { ApiService } from '../../../services/api.service';

// Define interfaces for your API response and transformed data
export interface EquipmentDartCount {
  equipment_id: number;
  equipment_name: string;
  dart_count: number;
}

export interface DefectListApiResponse {
  status: string;
  message: string;
  data: {
    equipment_dart_counts: EquipmentDartCount[];
    total_equipments: number;
    total_darts: number;
    filters_applied: {
      command_id: string | null;
      ship_id: string | null;
      department_id: string | null;
      // Removed date range properties from filters_applied as well, assuming they won't be returned
    };
  };
  status_code: number;
}

// Chart data structure for PrimeNG Chart
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    backgroundColor: string;
    data: number[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DefectListService {
  // The endpoint specific to this service, relative to the base apiUrl in ApiService
  private defectListEndpoint = 'dart/defect-list/';

  // A BehaviorSubject to hold and emit the current loading state
  private _loading = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading.asObservable();

  // Inject your generic ApiService
  constructor(private apiService: ApiService) { }

  /**
   * Fetches defect counts based on provided filters.
   * @param commandId Optional command ID.
   * @param departmentId Optional department ID.
   * @param shipId Optional ship ID.
   * @returns An Observable of the transformed ChartData.
   */
  getDefectCounts(
    commandId: string | null,
    departmentId: string | null,
    shipId: string | null
    // Removed startDate?: Date,
    // Removed endDate?: Date
  ): Observable<ChartData> {
    this._loading.next(true); // Set loading to true

    const params: { [key: string]: any } = {};
    if (commandId) {
      params['command_id'] = commandId;
    }
    if (departmentId) {
      params['department_id'] = departmentId;
    }
    if (shipId) {
      params['ship_id'] = shipId;
    }
    // Removed date filter params
    // if (startDate) {
    //   params['start_date'] = startDate.toISOString().split('T')[0];
    // }
    // if (endDate) {
    //   params['end_date'] = endDate.toISOString().split('T')[0];
    // }

    // Use apiService.get method here
    return this.apiService.get<DefectListApiResponse>(this.defectListEndpoint, params).pipe(
      map(response => this.transformApiResponseToChartData(response)),
      // The handleError is now handled by ApiService, but we keep a catchError here
      // to transform the error into an empty chart data for the UI
      catchError(error => {
        console.error('Error fetching defect data in DefectListService:', error); // Changed DartService to DefectListService
        this._loading.next(false); // Ensure loading is turned off on error
        // Return an empty ChartData object or a default error state
        return of({ labels: [], datasets: [{ label: 'Error Loading Data', backgroundColor: '#ef4444', data: [] }] });
        // Or rethrow the error if you want a global error handler to catch it
        // return throwError(() => error);
      }),
      finalize(() => this._loading.next(false)) // Ensure loading is turned off after success or final error
    );
  }

  /**
   * Transforms the raw API response into the format suitable for PrimeNG charts.
   * @param response The API response object.
   * @returns ChartData object.
   */
  private transformApiResponseToChartData(response: DefectListApiResponse): ChartData {
    if (response.status !== 'success' || !response.data || !response.data.equipment_dart_counts) {
      // Handle cases where API indicates failure or malformed data
      console.warn('API response indicates an issue or missing data in transformApiResponseToChartData:', response);
      // Return a default empty chart data set
      return { labels: [], datasets: [] };
    }

    const labels = response.data.equipment_dart_counts.map(item => item.equipment_name);
    const data = response.data.equipment_dart_counts.map(item => item.dart_count);

    const shipLabel = response.data.filters_applied.ship_id
      ? `Ship ID ${response.data.filters_applied.ship_id}` // You might want to map ship_id to ship_name here if you have that data
      : 'All Ships';

    return {
      labels: labels,
      datasets: [
        {
          label: `${shipLabel} - Defects`,
          backgroundColor: '#42A5F5', // You can make this dynamic based on criteria
          data: data
        }
      ]
    };
  }
}