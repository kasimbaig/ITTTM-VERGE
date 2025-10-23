import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { ShipUserDashboardComponent } from './sfd/ship-user-dashboard/ship-user-dashboard.component';
import { LogComponent } from './shared/components/log/log.component';

const routes: Routes = [
  { 
    path: 'home', 
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'about-us', 
    loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUsComponent)
  },
  { 
    path: 'contact-us', 
    loadComponent: () => import('./contact-us/contact-us.component').then(m => m.ContactUsComponent)
  },
  { 
    path: 'new-user-registration', 
    loadComponent: () => import('./new-user-registration/new-user-registration.component').then(m => m.NewUserRegistrationComponent)
  },
  { path: 'login', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  // { path: 'newlogin', component: LogComponent },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Protect all child routes with AuthGuard
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'sfd',
        loadChildren: () => import('./sfd/sfd.module').then((m) => m.SfdModule),
      },
      {
        path: 'masters',
        loadChildren: () =>
          import('./masters/masters.module').then((m) => m.MastersModule),
        data: {
          breadcrumb: 'Masters'
        },
      },
      {
        path: 'maintop',
        loadChildren: () =>
          import('./maintop/maintop.module').then((m) => m.MaintopModule),
      },
      {
        path: 'dart',
        loadChildren: () =>
          import('./dart/dart.module').then((m) => m.DartModule),
      },
      {
        path:'srar',
        loadChildren:()=> import('./srar/srar.module').then((m)=>m.SrarModule)
      },
      {
        path: 'setup',
        loadChildren: () =>
          import('./setup/setup.module').then((m) => m.SetupModule),
      },
      {
        path: 'forms/etma',
        loadComponent: () =>
          import('./forms-modules/etma-main-component/etma-main-component.component').then((m) => m.EtmaMainComponentComponent),
        children: [
          { path: '', redirectTo: 'gtg-load-trial-reports', pathMatch: 'full' },
          { path: 'gtg-load-trial-reports', redirectTo: '', pathMatch: 'full' },
          { path: 'transaction/etma/gtg-load-trial-report', loadComponent: () => import('./forms-modules/forms/transaction/etma/gtg-load-trial-report.component').then((m) => m.GtgLoadTrialReportComponent) }
        ]
      },
      {
        path: 'forms/seg',
        loadComponent: () =>
          import('./forms-modules/seg-main-component/seg-main-component.component').then((m) => m.SegMainComponentComponent),
        children: [
          { path: '', redirectTo: 'seg-form-reports', pathMatch: 'full' },
          { path: 'seg-form-reports', redirectTo: '', pathMatch: 'full' },
          { path: 'transaction/seg/seg-form', loadComponent: () => import('./forms-modules/forms/seg-form/seg-form.component').then((m) => m.SegFormComponent) }
        ]
      },
      {
        path: 'forms/hitu',
        loadComponent: () =>
          import('./forms-modules/hitu-main-component/hitu-main-component.component').then((m) => m.HituMainComponentComponent),
        children: [
          { path: '', redirectTo: 'preliminary-form', pathMatch: 'full' },
          { path: 'preliminary-form', loadComponent: () => import('./forms-modules/forms/preliminary-form/etma-form.component').then((m) => m.EtmaFormComponent) },
          { path: 'intermediate-form', loadComponent: () => import('./forms-modules/forms/intermediate-form/intermediate-form.component').then((m) => m.IntermediateFormComponent) },
          { path: 'final-form', loadComponent: () => import('./forms-modules/forms/final-form/final-form.component').then((m) => m.FinalFormComponent) },
          { path: 'uw-compartments-form', loadComponent: () => import('./forms-modules/forms/uw-compartments-form/uw-compartments-form.component').then((m) => m.UwCompartmentsFormComponent) }
        ]
      },
      {
        path: 'route-config',
        loadComponent: () =>
          import('./route-config/route-config.component').then((m) => m.RouteConfigComponent),
      },
      {
        path: 'commentor-sheet',
        loadComponent: () =>
          import('./commentor-sheet/commentor-sheet.component').then((m) => m.CommentorSheetComponent),
      },
      {
        path: 'uw-compartments-commentor-sheet',
        loadComponent: () =>
          import('./commentor-sheet/uw-compartments-commentor-sheet.component').then((m) => m.UwCompartmentsCommentorSheetComponent),
      },
      {
        path: 'final-commentor-sheet',
        loadComponent: () =>
          import('./commentor-sheet/final-commentor-sheet.component').then((m) => m.FinalCommentorSheetComponent),
      },
      {
        path: 'intermediate-commentor-sheet',
        loadComponent: () =>
          import('./commentor-sheet/intermediate-commentor-sheet.component').then((m) => m.IntermediateCommentorSheetComponent),
      },
      {
        path: 'preliminary-commentor-sheet',
        loadComponent: () =>
          import('./commentor-sheet/preliminary-commentor-sheet.component').then((m) => m.PreliminaryCommentorSheetComponent),
      },
      {
        path: 'seg-form-commentor-sheet',
        loadComponent: () =>
          import('./forms-modules/forms/seg-form/seg-form-commentor-sheet.component').then((m) => m.SegFormCommentorSheetComponent),
      }
      
    ],
  },
  // { path: 'masters', loadChildren: () => import('./masters/masters.module').then(m => m.MastersModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
