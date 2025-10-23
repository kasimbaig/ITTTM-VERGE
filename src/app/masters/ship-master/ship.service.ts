import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Removed 'take' from import
import { ApiService } from '../../services/api.service';
import { Option, Ship } from './ship.model';

@Injectable({ providedIn: 'root' })
export class ShipService {
  private readonly endpoint = 'master/ship/';
  private ships$ = new BehaviorSubject<Ship[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private api: ApiService) {}

  getShips(): Observable<Ship[]> {
    return this.ships$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllShipsData(): void {
    this.loading$.next(true);
  
    this.api.get<{ count: number; next: string | null; previous: string | null; results: Ship[] }>(this.endpoint)
      .subscribe({
        next: (response) => {
          const shipsArray = Array.isArray(response?.results) ? response.results : [];
          this.ships$.next(shipsArray);
          this.loading$.next(false);
        },
        error: (err) => {
          console.error('ShipService: Error loading ships:', err);
          this.loading$.next(false);
        }
      });
  }
  

  addShip(ship: Ship): Observable<Ship> {
    return this.api.post<Ship>(this.endpoint, ship).pipe(
      tap(() => this.loadAllShipsData())
    );
  }

  updateShip(id: number, ship: Ship): Observable<Ship> {
    return this.api.put<Ship>(`${this.endpoint}${id}/`, ship).pipe(
      tap(() => this.loadAllShipsData())
    );
  }

  deleteShip(id: number): Observable<any> {
    return this.api.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllShipsData())
    );
  }

  getShipOptions(): Observable<Option[]> {
    //console.log('ShipService: getShipOptions called.');
    return this.ships$.asObservable().pipe(
      // Removed take(1) here to ensure it receives the updated data
      map((ships) => {
        const options = ships
          .filter(ship => ship.id !== undefined && ship.id !== null)
          .map((ship) => ({
            label: ship.name,
            value: ship.id as number,
          }));
        //console.log('ShipService: getShipOptions mapping complete, options count:', options.length);
        return options;
      })
    );
  }
}
