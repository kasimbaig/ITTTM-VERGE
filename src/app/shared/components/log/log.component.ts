import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../core/auth/services/auth-service/auth.service';

@Component({
  selector: 'app-log',
  imports: [FormsModule,CommonModule],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss',
})
export class LogComponent {
  username: string = '';
  password: string = '';
  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) {}
  onLogin() {
    this.apiService
      .post(`api/auth/token/`, {
        loginname: this.username,
        password: this.password,
      })
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          localStorage.setItem('currentUser', JSON.stringify(data));
          this.authService.setCurrentUser(data); // Update BehaviorSubject
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
  showPassword = false;

togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

}
