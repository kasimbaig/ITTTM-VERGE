// src/app/services/defect-list.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { RefitCyclesResponse } from '../models/refit-cycle.model';


@Injectable({
  providedIn: 'root'
})
export class DefectListService {
  // Define the specific API endpoint for refit cycles
  private readonly REFIT_CYCLES_ENDPOINT = 'maintop/refit-cycles/';

  constructor(private apiService: ApiService) { }

  /**
   * Fetches refit cycles data from the backend API.
   *
   * @param commandId The ID of the command to filter refit cycles by.
   * @param startDate The start date for the refit cycles period (format: YYYY-MM-DD).
   * @param endDate The end date for the refit cycles period (format: YYYY-MM-DD).
   * @returns An Observable that emits the RefitCyclesResponse from the API.
   */
  getRefitCycles(commandId: number, startDate: string, endDate: string): Observable<RefitCyclesResponse> {
    // Construct query parameters for the API call
    const params = {
      command_id: commandId.toString(), // API expects string for query params
      start_date: startDate,
      end_date: endDate
    };
    // Use the generic ApiService to make the GET request
    return this.apiService.get<RefitCyclesResponse>(this.REFIT_CYCLES_ENDPOINT, params);
  }
}
