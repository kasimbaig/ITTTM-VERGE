import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private roleSubject = new BehaviorSubject<string>('Super Admin');
  role$ = this.roleSubject.asObservable();

  setRole(role: string) {
    this.roleSubject.next(role);
  }

  get currentRole() {
    return this.roleSubject.getValue();
  }
}
