import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Removed 'take' from import
import { ApiService } from '../../../services/api.service';
import { Department } from '../../../shared/models/department.model';
import { Option } from '../ship.model';


@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly endpoint = 'master/department/';
  private departments$ = new BehaviorSubject<Department[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getDepartments(): Observable<Department[]> {
    return this.departments$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllDepartmentsData(): void {
    //console.log('DepartmentService: loadAllDepartmentsData called.');
    this.loading$.next(true);
  
    this.apiService.get<any>(this.endpoint).subscribe({
      next: (response) => {
        // Handle both array and object with results
        const departmentsArray = Array.isArray(response)
          ? response
          : Array.isArray(response?.results)
            ? response.results
            : [];
  
        console.log(
          'DepartmentService: API call successful, received departments:',
          departmentsArray.length
        );
  
        this.departments$.next(departmentsArray);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('DepartmentService: Error loading departments:', err);
        this.departments$.next([]); // Clear in case of error
        this.loading$.next(false);
      }
    });
  }
  

  addDepartment(department: Department): Observable<Department> {
    return this.apiService.post<Department>(this.endpoint, department).pipe(
      tap(() => this.loadAllDepartmentsData())
    );
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.apiService.put<Department>(`${this.endpoint}${id}/`, department).pipe(
      tap(() => this.loadAllDepartmentsData())
    );
  }

  deleteDepartment(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllDepartmentsData())
    );
  }

  getDepartmentOptions(): Observable<Option[]> {
   
    return this.departments$.asObservable().pipe(
      // Removed take(1) here to ensure it receives the updated data
      map(departments => {
        const options = departments
          .filter(department => department.id !== undefined && department.id !== null)
          .map(department => ({
            label: department.name,
            value: department.id as number,
          }));
          
        return options;
      })
    );
  }
}
