import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Removed 'take' from import
import { ApiService } from '../../services/api.service';
import { Supplier } from '../models/supplier.model';
import { Option } from '../models/ship.model';


@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly endpoint = 'master/supplier/';
  private suppliers$ = new BehaviorSubject<Supplier[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getSuppliers(): Observable<Supplier[]> {
    return this.suppliers$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllSuppliersData(): void {
    //console.log('SupplierService: loadAllSuppliersData called.');
    this.loading$.next(true);
    // API returns array directly, not { results: [] }
    this.apiService.get<Supplier[]>(this.endpoint).subscribe({
      next: (response) => {
        const suppliersArray = Array.isArray(response) ? response : []; // Check if response is array
        //console.log('SupplierService: API call successful, received suppliers:', suppliersArray.length);
        this.suppliers$.next(suppliersArray);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('SupplierService: Error loading suppliers:', err);
        this.loading$.next(false);
      }
    });
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.apiService.post<Supplier>(this.endpoint, supplier).pipe(
      tap(() => this.loadAllSuppliersData())
    );
  }

  updateSupplier(id: number, supplier: Supplier): Observable<Supplier> {
    return this.apiService.put<Supplier>(`${this.endpoint}${id}/`, supplier).pipe(
      tap(() => this.loadAllSuppliersData())
    );
  }

  deleteSupplier(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllSuppliersData())
    );
  }

  getSupplierOptions(): Observable<Option[]> {
    //console.log('SupplierService: getSupplierOptions called.');
    return this.suppliers$.asObservable().pipe(
      // Removed take(1) here to ensure it receives the updated data
      map(suppliers => {
        const options = suppliers
          .filter(supplier => supplier.id !== undefined && supplier.id !== null)
          .map(supplier => ({
            label: supplier.name,
            value: supplier.id as number,
          }));
        //console.log('SupplierService: getSupplierOptions mapping complete, options count:', options.length);
        return options;
      })
    );
  }
}
