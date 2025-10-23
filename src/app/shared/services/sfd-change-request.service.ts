// src/app/services/sfd-change-request.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SfdChangeRequest, Option } from '../models/sfd-change-request.model';
import { ApiService } from '../../services/api.service';

@Injectable({
  providedIn: 'root',
})
export class SfdChangeRequestService {
  private readonly endpoint = 'sfd/sfd-change-requests/'; // Your API endpoint
  private sfdChangeRequests$ = new BehaviorSubject<SfdChangeRequest[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getSfdChangeRequests(): Observable<SfdChangeRequest[]> {
    return this.sfdChangeRequests$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllSfdChangeRequestsData(): void {
    this.loading$.next(true);
    this.apiService.get<SfdChangeRequest[]>(this.endpoint).subscribe({
      next: (requests) => {
        this.sfdChangeRequests$.next(requests);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading SFD Change Requests:', err);
        this.loading$.next(false);
      },
    });
  }

  addSfdChangeRequest(request: SfdChangeRequest): Observable<SfdChangeRequest> {
    return this.apiService.post<SfdChangeRequest>(this.endpoint, request).pipe(
      tap(() => this.loadAllSfdChangeRequestsData()) // Reload data after successful add
    );
  }

  updateSfdChangeRequest(
    id: number,
    request: SfdChangeRequest
  ): Observable<SfdChangeRequest> {
    return this.apiService
      .put<SfdChangeRequest>(`${this.endpoint}${id}/`, request)
      .pipe(
        tap(() => this.loadAllSfdChangeRequestsData()) // Reload data after successful update
      );
  }

  deleteSfdChangeRequest(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllSfdChangeRequestsData()) // Reload data after successful delete
    );
  }
}