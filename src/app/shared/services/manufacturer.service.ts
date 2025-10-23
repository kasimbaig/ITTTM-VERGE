import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Removed 'take' from import
import { ApiService } from '../../services/api.service';
import { Manufacturer } from '../models/manufacturer.model';
import { Option } from '../models/ship.model';


@Injectable({ providedIn: 'root' })
export class ManufacturerService {
  private readonly endpoint = 'master/manufacturers/';
  private manufacturers$ = new BehaviorSubject<Manufacturer[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getManufacturers(): Observable<Manufacturer[]> {
    return this.manufacturers$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllManufacturersData(): void {
    //console.log('ManufacturerService: loadAllManufacturersData called.');
    this.loading$.next(true);
    // API returns { data: [] }, not { results: [] } or direct array
    this.apiService.get<{ data: Manufacturer[] }>(this.endpoint).subscribe({
      next: (response) => {
        const manufacturersArray = Array.isArray(response.data) ? response.data : []; // Extract from 'data'
        //console.log('ManufacturerService: API call successful, received manufacturers:', manufacturersArray.length);
        this.manufacturers$.next(manufacturersArray);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('ManufacturerService: Error loading manufacturers:', err);
        this.loading$.next(false);
      }
    });
  }

  addManufacturer(manufacturer: Manufacturer): Observable<Manufacturer> {
    return this.apiService.post<Manufacturer>(this.endpoint, manufacturer).pipe(
      tap(() => this.loadAllManufacturersData())
    );
  }

  updateManufacturer(id: number, manufacturer: Manufacturer): Observable<Manufacturer> {
    return this.apiService.put<Manufacturer>(`${this.endpoint}${id}/`, manufacturer).pipe(
      tap(() => this.loadAllManufacturersData())
    );
  }

  deleteManufacturer(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllManufacturersData())
    );
  }

  getManufacturerOptions(): Observable<Option[]> {
    //console.log('ManufacturerService: getManufacturerOptions called.');
    return this.manufacturers$.asObservable().pipe(
      // Removed take(1) here to ensure it receives the updated data
      map(manufacturers => {
        const options = manufacturers
          .filter(manufacturer => manufacturer.id !== undefined && manufacturer.id !== null)
          .map(manufacturer => ({
            label: manufacturer.name,
            value: manufacturer.id as number,
          }));
        //console.log('ManufacturerService: getManufacturerOptions mapping complete, options count:', options.length);
        return options;
      })
    );
  }
}
