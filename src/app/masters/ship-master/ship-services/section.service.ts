// src/app/services/section.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { map, Observable } from 'rxjs';
import { Option } from '../ship.model';
import { Section } from '../../../shared/models/section.model';


@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private sectionEndpoint = 'master/section/';

  constructor(private apiService: ApiService) {}

  getSections(): Observable<Section[]> {
    return this.apiService.get<Section[]>(this.sectionEndpoint);
  }

  getSectionById(id: number): Observable<Section> {
    return this.apiService.get<Section>(`${this.sectionEndpoint}${id}/`);
  }

  addSection(section: Omit<Section, 'id' | 'active' | 'created_by'>): Observable<Section> {
    return this.apiService.post<Section>(this.sectionEndpoint, section);
  }

  // Generic POST method for all operations (add, update, delete) with action key
  postSection(payload: any): Observable<any> {
    return this.apiService.post<any>(this.sectionEndpoint, payload);
  }

  updateSection(id: number, section: Section): Observable<Section> {
    return this.apiService.put<Section>(`${this.sectionEndpoint}${id}/`, section);
  }

  deleteSection(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.sectionEndpoint}${id}/`);
  }

  // New method to get sections specifically for dropdown options
  getSectionOptions(): Observable<Option[]> {
    return this.apiService.get<Section[]>(`${this.sectionEndpoint}?is_dropdown=true`).pipe(
      map(sections => sections.map(section => ({
        label: section.name,
        value: section.id as number // Ensure ID is a number
      })))
    );
  }
}