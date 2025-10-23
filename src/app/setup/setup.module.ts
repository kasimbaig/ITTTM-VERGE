import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SetupComponent } from './setup.component';
import { UsersComponent } from './users/users.component';
import { RoleComponent } from './role/role.component';
import { RootConfigComponent } from './root-config/root-config.component';
import { RoleAccessComponent } from './role-access/role-access.component';
import { UserAccessComponent } from './user-access/user-access.component';
import { PrivilegesComponent } from './privileges/privileges.component';

const routes: Routes = [
  { path: '', component: SetupComponent },
  { path: 'users', component: UsersComponent },
  { path: 'role', component: RoleComponent },
  { path: 'root-config', component: RootConfigComponent },
  { path: 'role-access', component: RoleAccessComponent },
  { path: 'user-access', component: UserAccessComponent },
  { path: 'privileges', component: PrivilegesComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class SetupModule { }
