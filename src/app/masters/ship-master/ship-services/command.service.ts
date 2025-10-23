import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service'; // Adjust path
import { Command } from '../../../shared/models/command.model'; // Adjust path
import { Option } from '../ship.model';

@Injectable({
  providedIn: 'root',
})
export class CommandService {
  private readonly endpoint = '/master/command/';
  private commands$ = new BehaviorSubject<Command[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  /**
   * Returns an observable of the current list of commands.
   * Components can subscribe to this to get the latest data.
   */
  getCommands(): Observable<Command[]> {
    return this.commands$.asObservable();
  }

  /**
   * Returns an observable of the current loading status.
   */
  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  /**
   * Fetches all commands from the API and updates the internal BehaviorSubject.
   * This should typically be called once at application startup or when a refresh is needed.
   */
  loadAllCommandsData(): void {
    this.loading$.next(true);
    this.apiService.get<Command[] | {count: number, next: string | null, previous: string | null, results: Command[]}>(`${this.endpoint}?is_dropdown=true`).subscribe({
      next: (data) => {
        // Handle both direct array and paginated response
        const commands = Array.isArray(data) ? data : data.results || [];
        this.commands$.next(commands);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('Error loading commands:', err);
        this.loading$.next(false);
        // Optionally, handle error state or show a user-friendly message
      },
    });
  }

  /**
   * Fetches a single command by its ID from the API.
   * Consider if you want to fetch from the BehaviorSubject's current value first for performance.
   */
  getCommandById(id: number): Observable<Command> {
    // Option 1: Always fetch from API (ensures latest data)
    return this.apiService.get<Command>(`${this.endpoint}${id}/`);

    // Option 2: Try to get from cached data first, then fall back to API if not found or stale
    // return this.commands$.asObservable().pipe(
    //   map(commands => commands.find(cmd => cmd.id === id)),
    //   switchMap(command => command ? of(command) : this.apiService.get<Command>(`${this.endpoint}${id}/`))
    // );
  }

  /**
   * Adds a new command via API and then refreshes the local state.
   */
  addCommand(command: Command): Observable<Command> {
    return this.apiService.post<Command>(this.endpoint, command).pipe(
      // After successful add, reload all commands to update the state for all subscribers
      // Or, if your API returns the full list, update the BehaviorSubject directly.
      // For simplicity, we'll just reload all.
      tap(() => this.loadAllCommandsData())
    );
  }

  /**
   * Updates an existing command via API and then refreshes the local state.
   */
  updateCommand(id: number, command: Command): Observable<Command> {
    return this.apiService.put<Command>(`${this.endpoint}${id}/`, command).pipe(
      tap(() => this.loadAllCommandsData())
    );
  }

  /**
   * Deletes a command via API and then refreshes the local state.
   */
  deleteCommand(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllCommandsData())
    );
  }

  /**
   * Returns an observable of commands formatted as PrimeNG Dropdown Options.
   */
  getCommandOptions(): Observable<Option[]> {
    return this.commands$.asObservable().pipe(
      map((commands) =>
        commands.map((cmd) => ({
          label: cmd.name,
          value: cmd.id,
        }))
      )
    );
  }
}
