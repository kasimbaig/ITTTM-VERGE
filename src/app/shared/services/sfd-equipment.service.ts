import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SfdEquipment } from '../models/sfd-equipment.model';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ShipEquipmentDetail } from '../models/ship-equipment-detail.model';

@Injectable({
  providedIn: 'root'
})
export class SfdEquipmentService {
 private readonly endpoint = 'master/equipment-ship-detail/'; // Adjust API endpoint as per your backend

  constructor(private apiService: ApiService) {}

  /**
   * Retrieves Equipment Ship Details based on optional filters.
   * @param sectionId Section ID filter.
   * @param groupId Group ID filter.
   * @param countryId Country ID filter.
   * @param supplierId Supplier ID filter.
   * @param modelId Model ID filter.
   * @param equipmentId Equipment ID filter.
   * @returns An observable of ShipEquipmentDetail array.
   */
  getShipEquipmentDetails(
    sectionId?: number | null,
    groupId?: number | null,
    countryId?: number | null,
    supplierId?: number | null,
    modelId?: number | null,
    equipmentId?: number | null
  ): Observable<ShipEquipmentDetail[]> {
    let params = new HttpParams();
    if (sectionId) {
      params = params.set('section_id', sectionId.toString());
    }
    if (groupId) {
      params = params.set('group_id', groupId.toString());
    }
    if (countryId) {
      params = params.set('country_id', countryId.toString());
    }
    if (supplierId) {
      params = params.set('supplier_id', supplierId.toString());
    }
    if (modelId) {
      params = params.set('model_id', modelId.toString());
    }
    if (equipmentId) {
      params = params.set('equipment_id', equipmentId.toString());
    }

    return this.apiService.get<ShipEquipmentDetail[]>(this.endpoint);
  }

  /**
   * Retrieves a single Ship Equipment Detail by ID.
   * @param id The ID of the Ship Equipment Detail.
   * @returns An observable of a single ShipEquipmentDetail.
   */
  getShipEquipmentDetailById(id: number): Observable<ShipEquipmentDetail> {
    return this.apiService.get<ShipEquipmentDetail>(`${this.endpoint}${id}/`);
  }

  /**
   * Adds new Ship Equipment Detail.
   * @param detail The ShipEquipmentDetail object to add.
   * @returns An observable of the added ShipEquipmentDetail.
   */
  addShipEquipmentDetail(detail: ShipEquipmentDetail): Observable<ShipEquipmentDetail> {
    const payload = this.preparePayload(detail);
    return this.apiService.post<ShipEquipmentDetail>(this.endpoint, payload);
  }

  /**
   * Updates existing Ship Equipment Detail.
   * @param id The ID of the Ship Equipment Detail to update.
   * @param detail The ShipEquipmentDetail object with updated data.
   * @returns An observable of the updated ShipEquipmentDetail.
   */
  updateShipEquipmentDetail(id: number, detail: ShipEquipmentDetail): Observable<ShipEquipmentDetail> {
    const payload = this.preparePayload(detail);
    return this.apiService.put<ShipEquipmentDetail>(`${this.endpoint}${id}/`, payload);
  }

  /**
   * Deletes Ship Equipment Detail by ID.
   * @param id The ID of the Ship Equipment Detail to delete.
   * @returns An observable of the API response.
   */
  deleteShipEquipmentDetail(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`);
  }

  private preparePayload(detail: ShipEquipmentDetail): any {
    const payload: any = { ...detail };

    // Convert nested objects to their IDs if they are objects, and ensure they are sent as IDs
    if (typeof payload.ship === 'object' && payload.ship !== null) {
      payload.ship = payload.ship.id;
    }
    if (typeof payload.equipment === 'object' && payload.equipment !== null) {
      payload.equipment = payload.equipment.id;
    }
    if (typeof payload.section === 'object' && payload.section !== null) {
      payload.section = payload.section.id;
    }
    if (typeof payload.group === 'object' && payload.group !== null) {
      payload.group = payload.group.id;
    }
    if (typeof payload.country === 'object' && payload.country !== null) {
      payload.country = payload.country.id;
    }
    if (typeof payload.supplier === 'object' && payload.supplier !== null) {
      payload.supplier = payload.supplier.id;
    }
    if (typeof payload.model === 'object' && payload.model !== null) {
      payload.model = payload.model.id;
    }

    // Remove derived properties from the payload before sending to API
    delete payload.shipNameDisplay;
    delete payload.equipmentCodeName;
    delete payload.equipmentNomenclature;

    return payload;
  }
}
