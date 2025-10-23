import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import {  SfdHierarchy } from '../../../shared/models/sfd-hierarchy.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class SfdHierarchyService {
  private readonly endpoint = 'master/sfd-hierarchy/';
  private sfdHierarchies$ = new BehaviorSubject<SfdHierarchy[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getSfdHierarchies(): Observable<SfdHierarchy[]> {
    return this.sfdHierarchies$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllSfdHierarchiesData(): void {
    this.loading$.next(true);
    forkJoin({
      sfdHierarchies: this.apiService.get<SfdHierarchy[]>(`${this.endpoint}?is_dropdown=true`),
    }).subscribe({
      next: ({ sfdHierarchies }) => {
        this.sfdHierarchies$.next(sfdHierarchies);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading SFD hierarchies:', err);
        this.loading$.next(false);
      },
    });
  }

  getSfdHierarchyById(id: number): Observable<SfdHierarchy> {
    return this.apiService.get<SfdHierarchy>(`${this.endpoint}${id}/`);
  }

  addSfdHierarchy(sfdHierarchy: SfdHierarchy): Observable<SfdHierarchy> {
    return this.apiService.post<SfdHierarchy>(this.endpoint, sfdHierarchy);
  }

  updateSfdHierarchy(
    id: number,
    sfdHierarchy: SfdHierarchy
  ): Observable<SfdHierarchy> {
    return this.apiService.put<SfdHierarchy>(`${this.endpoint}${id}/`, sfdHierarchy);
  }

  deleteSfdHierarchy(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`);
  }

  getSfdHierarchyOptions(): Observable<Option[]> {
    return this.sfdHierarchies$.asObservable().pipe(
      map((hierarchies) =>
        hierarchies.map((hierarchy) => ({
          label: hierarchy.name,
          value: hierarchy.id,
        }))
      )
    );
  }
}
