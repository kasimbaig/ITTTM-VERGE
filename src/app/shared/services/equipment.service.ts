import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Removed 'take' from import
import { ApiService } from '../../services/api.service';
import { Equipment } from '../models/equipment.model';
import { Option } from '../models/ship.model';


@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly endpoint = 'master/equipment/';
  private equipments$ = new BehaviorSubject<Equipment[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getEquipments(): Observable<Equipment[]> {
    return this.equipments$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllEquipmentsData(): void {
    //console.log('EquipmentService: loadAllEquipmentsData called.');
    this.loading$.next(true);
    // API returns array directly, not { results: [] }
    this.apiService.get<Equipment[]>(this.endpoint).subscribe({
      next: (response) => {
        const equipmentsArray = Array.isArray(response) ? response : []; // Check if response is array
        //console.log('EquipmentService: API call successful, received equipments:', equipmentsArray.length);
        this.equipments$.next(equipmentsArray);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('EquipmentService: Error loading equipments:', err);
        this.loading$.next(false);
      }
    });
  }

  addEquipment(equipment: FormData): Observable<any> {
    return this.apiService.post(this.endpoint, equipment).pipe(
      tap(() => this.loadAllEquipmentsData())
    );
  }

  updateEquipment(id: number, equipment: FormData): Observable<any> {
    return this.apiService.put(`${this.endpoint}${id}/`, equipment).pipe(
      tap(() => this.loadAllEquipmentsData())
    );
  }

  deleteEquipment(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllEquipmentsData())
    );
  }

  getEquipmentOptions(): Observable<Option[]> {
    //console.log('EquipmentService: getEquipmentOptions called.');
    return this.equipments$.asObservable().pipe(
      // Removed take(1) here to ensure it receives the updated data
      map(equipments => {
        const options = equipments
          .filter(equipment => equipment.id !== undefined && equipment.id !== null)
          .map(equipment => ({
            label: `${equipment.code} - ${equipment.name} (${equipment.nomenclature})`,
            value: equipment.id as number,
          }));
        //console.log('EquipmentService: getEquipmentOptions mapping complete, options count:', options.length);
        return options;
      })
    );
  }
}
