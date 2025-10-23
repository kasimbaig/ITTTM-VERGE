/**
 * @file sfd-equipment-document-details.service.ts
 * @description Service for managing Ship Equipment Document Details.
 * It provides basic CRUD operations. Master data loading is delegated to specific master services.
 */
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { ShipEquipmentDocDetail } from '../models/ship-equipment-doc-detail.model';

// Import all master services to trigger their data loading
import { ShipService } from '../../masters/ship-master/ship.service';
import { SectionService } from '../../masters/ship-master/ship-services/section.service';
import { GroupService } from '../../masters/ship-master/ship-services/group.service';
import { CountryService } from './country.service';
import { SupplierService } from './supplier.service';
import { EquipmentService } from './equipment.service';


@Injectable({
  providedIn: 'root',
})
export class SfdEquipmentDocumentDetailsService {
  private readonly endpoint = 'sfd/equipment-document-details/'; // Main endpoint for details

  private shipEquipmentDetailsSubject = new BehaviorSubject<ShipEquipmentDocDetail[]>([]);
  private loadingDetailsSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private api: ApiService,
    private toastService: ToastService,
    // Inject all master services to trigger their data loading
    private shipService: ShipService,
    private sectionService: SectionService,
    private groupService: GroupService,
    private countryService: CountryService,
    private supplierService: SupplierService,
    private equipmentService: EquipmentService
  ) {}

  getShipEquipmentDetailsObservable(): Observable<ShipEquipmentDocDetail[]> {
    return this.shipEquipmentDetailsSubject.asObservable();
  }

  getLoadingDetailsObservable(): Observable<boolean> {
    return this.loadingDetailsSubject.asObservable();
  }

  /**
   * Fetches ship equipment details with optional filters.
   * This method now fetches raw data; enrichment happens in the component.
   */
  loadShipEquipmentDetails(
sectionId: number | null, groupId: number | null, countryId: number | null, supplierId: number | null, modelId: number | null, equipmentId: number | null, referenceNo: any, category: any  ): void {
    //console.log('SfdEquipmentDocumentDetailsService: Loading ship equipment details...');
    this.loadingDetailsSubject.next(true);

    let params = new HttpParams();
    if (sectionId) { params = params.set('sectionId', sectionId.toString()); }
    if (groupId) { params = params.set('groupId', groupId.toString()); }
    if (countryId) { params = params.set('countryId', countryId.toString()); }
    if (supplierId) { params = params.set('supplierId', supplierId.toString()); }
    if (modelId) { params = params.set('modelId', modelId.toString()); }
    if (equipmentId) { params = params.set('equipmentId', equipmentId.toString()); }

    this.api.get<ShipEquipmentDocDetail[]>(this.endpoint).pipe(
      tap(data => //console.log('SfdEquipmentDocumentDetailsService: Raw details loaded.')),
      catchError(error => {
        console.error('SfdEquipmentDocumentDetailsService: Error loading details:', error);
        this.toastService.showError('Failed to load equipment details.');
        return of([]);
      })
    ).subscribe(
      (data) => {
        this.shipEquipmentDetailsSubject.next(data);
        this.loadingDetailsSubject.next(false);
      },
      () => {
        this.loadingDetailsSubject.next(false);
      }
    );
  }

  /**
   * Adds a new ship equipment detail.
   */
  addShipEquipmentDetail(detail: ShipEquipmentDocDetail): Observable<ShipEquipmentDocDetail> {
    //console.log('SfdEquipmentDocumentDetailsService: Adding new detail:', detail);
    // Ensure payload only sends IDs for related entities
    const payload = {
      ...detail,
      ship: typeof detail.ship === 'object' && detail.ship !== null ? detail.ship.id : detail.ship,
      equipment: typeof detail.equipment === 'object' && detail.equipment !== null ? detail.equipment.id : detail.equipment,
      manufacturer: typeof detail.manufacturer === 'object' && detail.manufacturer !== null ? detail.manufacturer.id : detail.manufacturer,
      supplier: typeof detail.supplier === 'object' && detail.supplier !== null ? detail.supplier.id : detail.supplier,
    };
    return this.api.post<ShipEquipmentDocDetail>(this.endpoint, payload).pipe(
      tap(() => {
        this.toastService.showSuccess('Detail added successfully!');
        this.loadShipEquipmentDetails(null, null, null, null, null, null,null,null); // Reload all after successful add
      }),
      catchError(error => {
        console.error('SfdEquipmentDocumentDetailsService: Error adding detail:', error);
        this.toastService.showError('Failed to add equipment detail.');
        throw error;
      })
    );
  }

  /**
   * Updates an existing ship equipment detail.
   */
  updateShipEquipmentDetail(id: number, detail: ShipEquipmentDocDetail): Observable<ShipEquipmentDocDetail> {
    //console.log(`SfdEquipmentDocumentDetailsService: Updating detail with ID ${id}:`, detail);
    const payload = {
      ...detail,
      ship: typeof detail.ship === 'object' && detail.ship !== null ? detail.ship.id : detail.ship,
      equipment: typeof detail.equipment === 'object' && detail.equipment !== null ? detail.equipment.id : detail.equipment,
      manufacturer: typeof detail.manufacturer === 'object' && detail.manufacturer !== null ? detail.manufacturer.id : detail.manufacturer,
      supplier: typeof detail.supplier === 'object' && detail.supplier !== null ? detail.supplier.id : detail.supplier,
    };
    return this.api.put<ShipEquipmentDocDetail>(`${this.endpoint}${id}/`, payload).pipe(
      tap(() => {
        this.toastService.showSuccess('Detail updated successfully!');
        this.loadShipEquipmentDetails(null, null, null, null, null, null,null,null); // Reload all after successful update
      }),
      catchError(error => {
        console.error('SfdEquipmentDocumentDetailsService: Error updating detail:', error);
        this.toastService.showError('Failed to update equipment detail.');
        throw error;
      })
    );
  }

  /**
   * Deletes a ship equipment detail by ID.
   */
  deleteShipEquipmentDetail(id: number): Observable<any> {
    //console.log(`SfdEquipmentDocumentDetailsService: Deleting detail with ID: ${id}`);
    return this.api.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => {
        this.toastService.showSuccess('Detail deleted successfully!');
        this.loadShipEquipmentDetails(null, null, null, null, null, null,null,null); // Reload all after successful delete
      }),
      catchError(error => {
        console.error('SfdEquipmentDocumentDetailsService: Error deleting detail:', error);
        this.toastService.showError('Failed to delete equipment detail.');
        throw error;
      })
    );
  }

  /**
   * Triggers loading of all master data in their respective services.
   * This method is called from the component's ngOnInit.
   */
  loadAllMasterData(): void {
    //console.log('SfdEquipmentDocumentDetailsService: Triggering master data load...');
    this.shipService.loadAllShipsData();
    this.sectionService.getSectionOptions();
    this.groupService.getGroupOptions();
    this.countryService.loadAllCountriesData();
    this.supplierService.loadAllSuppliersData(); // This service now handles both suppliers and manufacturers
    this.equipmentService.loadAllEquipmentsData();
  }
}