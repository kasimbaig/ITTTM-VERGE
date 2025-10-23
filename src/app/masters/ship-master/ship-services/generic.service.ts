// src/app/services/generic.service.ts
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { Generic } from '../../../shared/models/generic.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class GenericService {
  private genericEndpoint = 'master/generic/';

  constructor(private apiService: ApiService) {}

  getGenerics(): Observable<Generic[]> {
    return this.apiService.get<Generic[]>(this.genericEndpoint);
  }

  getGenericById(id: number): Observable<Generic> {
    return this.apiService.get<Generic>(`${this.genericEndpoint}${id}/`);
  }

  addGeneric(generic: Omit<Generic, 'id' | 'active' | 'created_by'>): Observable<Generic> {
    return this.apiService.post<Generic>(this.genericEndpoint, generic);
  }

  updateGeneric(id: number, generic: Generic): Observable<Generic> {
    return this.apiService.put<Generic>(`${this.genericEndpoint}${id}/`, generic);
  }

  deleteGeneric(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.genericEndpoint}${id}/`);
  }

  // New method to get generics specifically for dropdown options
  getGenericOptions(): Observable<Option[]> {
    return this.apiService.get<Generic[]>(`${this.genericEndpoint}?is_dropdown=true`).pipe(
      map(generics => generics.map(generic => ({
        label: generic.type, // Use code for label as per your JSON
        value: generic.id as number // Ensure ID is a number
      })))
    );
  }
}