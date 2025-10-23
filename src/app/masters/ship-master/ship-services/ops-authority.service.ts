import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { OpsAuthority } from '../../../shared/models/ops-authority.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class OpsAuthorityService {
  private readonly endpoint = 'master/ops-authority/';
  private authorities$ = new BehaviorSubject<OpsAuthority[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getAuthorities(): Observable<OpsAuthority[]> {
    return this.authorities$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllAuthoritiesData(): void {
    this.loading$.next(true);
    forkJoin({
      authorities: this.apiService.get<OpsAuthority[]>(`${this.endpoint}?is_dropdown=true`),
    }).subscribe({
      next: ({ authorities }) => {
        this.authorities$.next(authorities);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading ops authorities:', err);
        this.loading$.next(false);
      },
    });
  }

  getAuthorityById(id: number): Observable<OpsAuthority> {
    return this.apiService.get<OpsAuthority>(`${this.endpoint}${id}/`);
  }

  addAuthority(authority: OpsAuthority): Observable<OpsAuthority> {
    return this.apiService.post<OpsAuthority>(this.endpoint, authority);
  }

  updateAuthority(id: number, authority: OpsAuthority): Observable<OpsAuthority> {
    return this.apiService.put<OpsAuthority>(`${this.endpoint}${id}/`, authority);
  }

  deleteAuthority(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`);
  }

  getAuthorityOptions(): Observable<Option[]> {
    return this.authorities$.asObservable().pipe(
      map((authorities) =>
        authorities.map((auth) => ({
          label: auth.authority,
          value: auth.id,
        }))
      )
    );
  }
}
