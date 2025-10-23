import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { Option } from '../models/ship.model';
import { Unit } from '../models/unit.model';


@Injectable({ providedIn: 'root' })
export class UnitService {
  private readonly endpoint = 'master/unit/';
  private units$ = new BehaviorSubject<Unit[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getUnits(): Observable<Unit[]> {
    return this.units$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllUnitsData(): void {
    this.loading$.next(true);
    this.apiService.get<Unit[]>(this.endpoint).subscribe({
      next: (units) => {
        this.units$.next(units);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading units:', err);
        this.loading$.next(false);
      },
    });
  }

  addUnit(unit: Unit): Observable<Unit> {
    return this.apiService.post<Unit>(this.endpoint, unit).pipe(
      tap(() => this.loadAllUnitsData())
    );
  }

  updateUnit(id: number, unit: Unit): Observable<Unit> {
    return this.apiService.put<Unit>(`${this.endpoint}${id}/`, unit).pipe(
      tap(() => this.loadAllUnitsData())
    );
  }

  deleteUnit(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllUnitsData())
    );
  }

  getUnitOptions(): Observable<Option[]> {
    return this.units$.asObservable().pipe(
      map((units) =>
        units
          .filter((unit) => unit.id !== undefined && unit.id !== null)
          .map((unit) => ({
            label: unit.name,
            value: unit.id as number,
          }))
      )
    );
  }
}