// src/app/masters/ship-master/ship-services/ship-category.service.ts (Matches user's provided code)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { ShipCategory } from '../../../shared/models/ship-category.model'; // Assuming this model exists
import { Option } from '../ship.model';

export interface UnitType {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ShipCategoryService {
  private categoryEndpoint = 'master/ship-category/';
  private categoriesSubject = new BehaviorSubject<ShipCategory[]>([]);
  private categoryOptionsSubject = new BehaviorSubject<Option[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private unitTypeEndpoint = 'master/unit-type/';
  private unitTypesSubject = new BehaviorSubject<UnitType[]>([]);
  private unitTypeOptionsSubject = new BehaviorSubject<Option[]>([]);

  constructor(private apiService: ApiService) {}

  getCategories(): Observable<ShipCategory[]> {
    return this.categoriesSubject.asObservable();
  }

  getCategoryOptions(): Observable<Option[]> {
    return this.categoryOptionsSubject.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }
    getUnitTypes(): Observable<UnitType[]> {
    return this.unitTypesSubject.asObservable();
  }

  getUnitTypeOptions(): Observable<Option[]> {
    return this.unitTypeOptionsSubject.asObservable();
  }

   loadAllUnitTypesData(): void {
    this.loadingSubject.next(true);
    this.apiService.get<{ results: UnitType[] }>(this.unitTypeEndpoint).pipe(
      tap(response => {
        const unitTypes = response?.results || [];
        this.unitTypesSubject.next(unitTypes);

        const options = unitTypes.map((unit: UnitType) => ({
          label: unit.name,
          value: unit.id as number
        }));
        this.unitTypeOptionsSubject.next(options);
      })
    ).subscribe({
      next: () => this.loadingSubject.next(false),
      error: (error) => {
        this.loadingSubject.next(false);
        this.unitTypeOptionsSubject.next([]);
        console.error('Error loading unit types:', error);
      }
    });
  }

  loadAllCategoriesData(): void {
    this.loadingSubject.next(true);
    this.apiService.get<ShipCategory[] | { results: ShipCategory[] }>(`${this.categoryEndpoint}?is_dropdown=true`).pipe(
      tap(response => {
        // Handle both direct array and paginated response
        const categories = Array.isArray(response) ? response : (response as any)?.results || [];
  
        this.categoriesSubject.next(categories);
  
        const options = categories.map((category: ShipCategory) => ({
          label: category.name,
          value: category.id as number
        }));
        this.categoryOptionsSubject.next(options);
      })
    ).subscribe({
      next: () => this.loadingSubject.next(false),
      error: (error) => {
        this.loadingSubject.next(false);
        this.categoryOptionsSubject.next([]);
        console.error('Error loading ship categories:', error);
      }
    });
  }
  

  addCategory(category: Omit<ShipCategory, 'id' | 'active'>): Observable<ShipCategory> {
    return this.apiService.post<ShipCategory>(this.categoryEndpoint, category).pipe(
      tap(() => this.loadAllCategoriesData())
    );
  }

  updateCategory(id: number, category: ShipCategory): Observable<ShipCategory> {
    return this.apiService.put<ShipCategory>(`${this.categoryEndpoint}${id}/`, category).pipe(
      tap(() => this.loadAllCategoriesData())
    );
  }

  deleteCategory(id: number): Observable<any> {
    return this.apiService.delete(`${this.categoryEndpoint}${id}/`).pipe(
      tap(() => this.loadAllCategoriesData())
    );
  }
}
