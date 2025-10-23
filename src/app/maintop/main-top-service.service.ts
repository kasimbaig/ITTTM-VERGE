import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/services/auth-service/auth.service';
@Injectable({
  providedIn: 'root',
})
export class MainTopServiceService {
  private readonly apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private authService: AuthService) {}

  getHeaderData(): Observable<any> {
    return this.http.get('maintop/maintop-header', {
      headers: this.authService.currentUserValue,
    });
  }
  //   saveDepartment(){
  //     //console.log('New Department:', this.newDepartment);
  //     this.apiService.post(master/department/,this.newDepartment).subscribe({
  //       next: (data: any) => {
  //          //console.log(data)
  //          this.departments.push(data)
  //       },
  //       error: (error) => {
  //         console.error('Login failed:', error);
  //         alert('Invalid login credentials');
  //       }
  //     });
  //     this.closeDialog();
  //   }

  //   getDepartments(): void {
  //     this.apiService.get<any[]>('master/department/') // Adjust endpoint
  //       .subscribe({
  //         next: (data) => {
  //           this.departments = data;
  //         },
  //         error: (error) => {
  //           console.error('Error fetching departments:', error);
  //         }
  //       });
  //   }
}
