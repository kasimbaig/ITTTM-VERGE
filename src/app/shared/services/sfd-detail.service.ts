import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { SfdEquipment } from '../models/sfd-equipment.model';


@Injectable({
  providedIn: 'root'
})
export class SfdDetailService {

  private readonly endpoint = 'sfd/sfd-details/'; // Assuming this is the endpoint for SFD equipment
  private sfdEquipment$ = new BehaviorSubject<SfdEquipment[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getSfdEquipment(unitType: string | null, shipId: number | null, departmentId: number | null): Observable<SfdEquipment[]> {
    // This is a simplified example. The actual API might require a different structure for filters.
    // We can construct the query parameters based on the selections.
    const params: any = {};
    if (unitType) {
      params.unitType = unitType;
    }
    if (shipId) {
      params.shipId = shipId;
    }
    if (departmentId) {
      params.departmentId = departmentId;
    }
    
    this.loading$.next(true);
    return this.apiService.get<SfdEquipment[]>(this.endpoint).pipe(
      tap(data => {
        this.sfdEquipment$.next(data);
        this.loading$.next(false);
      })
    );
    
    // Dummy implementation for now to make the component work
    return this.sfdEquipment$.asObservable();
  }

  loadAllSfdEquipmentData(): void {
    this.loading$.next(true);
    this.apiService.get<SfdEquipment[]>(this.endpoint).subscribe({
      next: (equipment) => {
        this.sfdEquipment$.next(equipment);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading SFD equipment:', err);
        this.loading$.next(false);
      },
    });
  }

  addSfdEquipment(equipment: SfdEquipment): Observable<SfdEquipment> {
    return this.apiService.post<SfdEquipment>(this.endpoint, equipment).pipe(
      tap(() => this.loadAllSfdEquipmentData()) // Refresh the list after a successful add
    );
  }

  updateSfdEquipment(id: number, equipment: SfdEquipment): Observable<SfdEquipment> {
    return this.apiService.put<SfdEquipment>(`${this.endpoint}${id}/`, equipment).pipe(
      tap(() => this.loadAllSfdEquipmentData()) // Refresh the list after a successful update
    );
  }

  deleteSfdEquipment(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllSfdEquipmentData()) // Refresh the list after a successful delete
    );
  }
}