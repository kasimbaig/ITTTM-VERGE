import { ApiService } from '../../../services/api.service';
import { Component } from '@angular/core';
import { AuthService } from '../services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {}
  onLogin() {
    this.apiService
      .post(`api/auth/token/`, {
        loginname: this.username,
        password: this.password,
      })
      .subscribe({
        next: (data: any) => {
          localStorage.setItem('currentUser', JSON.stringify(data));
          this.authService.setCurrentUser(data);
          localStorage.setItem('user_role', data.user_roles[0]?.role);
          localStorage.setItem('user_process', data.user_roles[0]?.process);
          localStorage.setItem('unit_id', data.unit_id);
          this.router.navigate(['dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Invalid login credentials');
        },
      });
  }
}
