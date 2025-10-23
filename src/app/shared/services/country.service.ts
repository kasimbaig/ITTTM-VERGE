// src/app/services/country.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, take } from 'rxjs/operators';
import { ApiService } from '../../services/api.service'; // Adjust path if necessary
import { Country } from '../models/country.model';
import { Option } from '../models/ship.model';



@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private readonly endpoint = 'master/country/'; // Adjust endpoint as per your API
  private countries$ = new BehaviorSubject<Country[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getCountries(): Observable<Country[]> {
    return this.countries$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  loadAllCountriesData(): void {
    //console.log('CountryService: loadAllCountriesData called.');
    this.loading$.next(true);
    this.apiService.get<Country[]>(this.endpoint).subscribe({
      next: (response) => {
        const countriesArray = Array.isArray(response) ? response : [];
        //console.log('CountryService: API call successful, received countries:', countriesArray.length);
        this.countries$.next(countriesArray);
        this.loading$.next(false);
      },
      error: (err) => {
        console.error('CountryService: Error loading countries:', err);
        this.loading$.next(false);
      },
    });
  }

  getCountryById(id: number): Observable<Country> {
    return this.apiService.get<Country>(`${this.endpoint}${id}/`);
  }

  addCountry(country: Omit<Country, 'id' | 'active' | 'created_by' | 'created_date'>): Observable<Country> {
    return this.apiService.post<Country>(this.endpoint, country).pipe(
      tap(() => this.loadAllCountriesData())
    );
  }

  updateCountry(id: number, country: Country): Observable<Country> {
    return this.apiService.put<Country>(`${this.endpoint}${id}/`, country).pipe(
      tap(() => this.loadAllCountriesData())
    );
  }

  deleteCountry(id: number): Observable<any> {
    return this.apiService.delete(`${this.endpoint}${id}/`).pipe(
      tap(() => this.loadAllCountriesData())
    );
  }

  // New method to get countries specifically for dropdown options
  getCountryOptions(): Observable<Option[]> {
    //console.log('CountryService: getCountryOptions called.');
    return this.countries$.asObservable().pipe(
      take(1), // Take only the current value
      map((countries) => {
        const options = countries
          .filter((country) => country.id !== undefined && country.id !== null)
          .map((country) => ({
            label: country.name,
            value: country.id as number,
          }));
        //console.log('CountryService: getCountryOptions mapping complete, options count:', options.length);
        return options;
      })
    );
  }
}