import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private data: any;
  private reportName:any;
  setReportName(reportName:any) { this.reportName = reportName; }
  getReportName() { return this.reportName; }
  setData(data: any) { this.data = data; }
  getData() { return this.data; }
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && typeof error.error === 'string') {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}`;
      } else if (error.error && error.error.message) {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Generic GET method with optional type.
   */
  get<T = any>(endpoint: string, params?: { [key: string]: any }): Observable<T> {
    let httpOptions: { params?: HttpParams, headers?: HttpHeaders } = {};
    if (params) {
      httpOptions.params = new HttpParams({ fromObject: params });
    }
    
    // Set headers with user_role and user_process from localStorage
    const userRole = localStorage.getItem('user_role');
    const userProcess = localStorage.getItem('user_process');
    
    let headers = new HttpHeaders();
    if (userRole) {
      headers = headers.set('Authorized-by', userRole);
    }
    if (userProcess) {
      headers = headers.set('Process', userProcess);
    }
    
    httpOptions.headers = headers;
    
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, httpOptions).pipe(
      tap((data) => {
        
        return data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST method with optional type.
   */
  post<T = any>(endpoint: string, body: any): Observable<T> {
    let httpOptions: { headers?: HttpHeaders } = {};

    // Set headers with user_role and user_process from localStorage
    const userRole = localStorage.getItem('user_role');
    const userProcess = localStorage.getItem('user_process');
    
    let headers = new HttpHeaders();
    if (userRole) {
      headers = headers.set('Authorized-by', userRole);
    }
    if (userProcess) {
      headers = headers.set('Process', userProcess);
    }
    
    httpOptions.headers = headers;
    return this.http.post<T>(`${this.apiUrl}${endpoint}`,body, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic POST method with FormData for file uploads.
   */
  postFormData<T = any>(endpoint: string, formData: FormData): Observable<T> {
    let httpOptions: { headers?: HttpHeaders } = {};

    // Set headers with user_role and user_process from localStorage
    const userRole = localStorage.getItem('user_role');
    const userProcess = localStorage.getItem('user_process');
    
    let headers = new HttpHeaders();
    if (userRole) {
      headers = headers.set('Authorized-by', userRole);
    }
    if (userProcess) {
      headers = headers.set('Process', userProcess);
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    httpOptions.headers = headers;
    
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, formData, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generic PUT method with optional type.
   */
  put<T = any>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body).pipe(
     
      catchError(this.handleError)
    );
  }

  /**
   * Generic DELETE method with optional type.
   */
  delete<T = any>(endpoint: string, params?: { [key: string]: any }): Observable<T> {
    let httpOptions: { body?: any } = {};
    if (params) {
      httpOptions.body = params;
    }
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, httpOptions).pipe(
      
      catchError(this.handleError)
    );
  }

      formatDate(date: any, format: string = 'DD-MM-YYYY'): string {
      if (!date) return '';
      
      let dateObj: Date;
      
      // Handle different input types
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (typeof date === 'object' && date.getTime) {
        // Handle Date-like objects (e.g., from date pickers)
        dateObj = new Date(date.getTime());
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) return ''; // Return empty if invalid date
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      
      switch (format.toUpperCase()) {
        case 'DD-MM-YYYY':
          return `${day}-${month}-${year}`;
        case 'MM-DD-YYYY':
          return `${month}-${day}-${year}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY':
          return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`;
        default:
          return `${day}-${month}-${year}`;
      }
    }
}
