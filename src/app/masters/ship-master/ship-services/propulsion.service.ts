import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import {Propulsion } from '../../../shared/models/propulsion.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class PropulsionService {
  private readonly endpoint = 'master/propulsion/';
  private propulsions$ = new BehaviorSubject<Propulsion[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getPropulsions(): Observable<Propulsion[]> {
    return this.propulsions$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllPropulsionData(): void {
    this.loading$.next(true);
    forkJoin({
      propulsions: this.apiService.get<Propulsion[]>(`${this.endpoint}?is_dropdown=true`),
    }).subscribe({
      next: ({ propulsions }) => {
        this.propulsions$.next(propulsions);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading propulsions:', err);
        this.loading$.next(false);
      },
    });
  }

  getPropulsionById(id: number): Observable<Propulsion> {
    return this.apiService.get<Propulsion>(`${this.endpoint}${id}/`);
  }

  addPropulsion(propulsion: Propulsion): Observable<Propulsion> {
    return this.apiService.post<Propulsion>(this.endpoint, propulsion);
  }

  updatePropulsion(id: number, propulsion: Propulsion): Observable<Propulsion> {
    return this.apiService.put<Propulsion>(`${this.endpoint}${id}/`, propulsion);
  }

  deletePropulsion(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`);
  }

  getPropulsionOptions(): Observable<Option[]> {
    return this.propulsions$.asObservable().pipe(
      map((propulsions) =>
        propulsions.map((prop) => ({
          label: prop.name,
          value: prop.id,
        }))
      )
    );
  }
}
