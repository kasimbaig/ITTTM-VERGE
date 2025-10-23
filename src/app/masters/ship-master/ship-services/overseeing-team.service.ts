import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { OverseeingTeam } from '../../../shared/models/overseeing-team.model';
import { Option } from '../ship.model';


@Injectable({
  providedIn: 'root',
})
export class OverseeingTeamService {
  private readonly endpoint = 'master/overseeing-team/';
  private overseeingTeams$ = new BehaviorSubject<OverseeingTeam[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getOverseeingTeams(): Observable<OverseeingTeam[]> {
    return this.overseeingTeams$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllOverseeingTeamsData(): void {
    this.loading$.next(true);
    forkJoin({
      overseeingTeams: this.apiService.get<OverseeingTeam[]>(`${this.endpoint}?is_dropdown=true`),
    }).subscribe({
      next: ({ overseeingTeams }) => {
        this.overseeingTeams$.next(overseeingTeams);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading overseeing teams:', err);
        this.loading$.next(false);
      },
    });
  }

  getOverseeingTeamById(id: number): Observable<OverseeingTeam> {
    return this.apiService.get<OverseeingTeam>(`${this.endpoint}${id}/`);
  }

  addOverseeingTeam(team: OverseeingTeam): Observable<OverseeingTeam> {
    return this.apiService.post<OverseeingTeam>(this.endpoint, team);
  }

  updateOverseeingTeam(id: number, team: OverseeingTeam): Observable<OverseeingTeam> {
    return this.apiService.put<OverseeingTeam>(`${this.endpoint}${id}/`, team);
  }

  deleteOverseeingTeam(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`);
  }

  getOverseeingTeamOptions(): Observable<Option[]> {
    return this.overseeingTeams$.asObservable().pipe(
      map((teams) =>
        teams.map((team) => ({
          label: team.name,
          value: team.id,
        }))
      )
    );
  }
}