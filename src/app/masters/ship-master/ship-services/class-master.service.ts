import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { ClassMaster } from '../../../shared/models/class-master.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class ClassMasterService {
  private readonly endpoint = 'master/class/';
  private classes$ = new BehaviorSubject<ClassMaster[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getClasses(): Observable<ClassMaster[]> {
    return this.classes$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllClassesData(): void {
    this.loading$.next(true);
    forkJoin({
      classes: this.apiService.get<{ status: number; data: ClassMaster[] }>(this.endpoint),
    }).subscribe({
      next: ({ classes }) => {
        this.classes$.next(classes.data);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading classes:', err);
        this.loading$.next(false);
      },
    });
  }

  getClassById(id: number): Observable<ClassMaster> {
    return this.apiService.get<ClassMaster>(`${this.endpoint}${id}/`);
  }

  addClass(classMaster: ClassMaster): Observable<ClassMaster> {
    return this.apiService.post<ClassMaster>(this.endpoint, classMaster);
  }

  updateClass(id: number, classMaster: ClassMaster): Observable<ClassMaster> {
    return this.apiService.put<ClassMaster>(`${this.endpoint}${id}/`, classMaster);
  }

  deleteClass(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`);
  }

  getClassOptions(): Observable<Option[]> {
    return this.classes$.asObservable().pipe(
      map((classes) =>
        classes.map((cls) => ({
          label: cls.name,
          value: cls.id,
        }))
      )
    );
  }
}
