import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DartDashboardComponent } from './dart-dashboard/dart-dashboard/dart-dashboard.component';
import { DartReportComponent } from './dart-report/dart-report.component';
import { AgencyComponent } from './dart-masters/agency/agency.component';
import { DelayComponent } from './dart-masters/delay/delay.component';
import { RefitComponent } from './dart-masters/refit/refit.component';
import { RepairAgencyComponent } from './dart-masters/repair-agency/repair-agency.component';
import { SeverityComponent } from './dart-masters/severity/severity.component';
import { DefectStrokeComponent } from './dart-transaction/defect-stroke/defect-stroke.component';
import { RoutineComponent } from './dart-transaction/routine/routine.component';
import { DartMainComponent } from './dart-main/dart-main.component';
import { DrtChartComponent } from './drt-chart/drt-chart.component';


// const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   { path: 'dart', component: DartDashboardComponent },
//   { path: 'dart-report', component: DartReportComponent },
//   { path: 'dart-delay', component: DelayComponent },
//   { path: 'dart-agency', component: AgencyComponent },
//   { path: 'dart-refit', component: RefitComponent },
//   { path: 'dart-repairagency', component: RepairAgencyComponent },
//   { path: 'dart-severity', component: SeverityComponent },
//   { path: 'dart-defectstroke', component: DefectStrokeComponent },
//   { path: 'dart-routine', component: RoutineComponent },




// ];
const routes: Routes = [
  {
    path: '',
    component: DartMainComponent,
    children: [
      { path: '', redirectTo: 'dart-dashboard', pathMatch: 'full' },
      { path: 'dart-dashboard', component: DartDashboardComponent },
      {
        path: 'dart-master',
        children: [
          { path: 'dart-delay', component: DelayComponent },
          { path: 'dart-agency', component: AgencyComponent },
          { path: 'dart-refit', component: RefitComponent },
          { path: 'dart-repairagency', component: RepairAgencyComponent },
          { path: 'dart-severity', component: SeverityComponent },
        ],
      },
      {
        path: 'dart-transaction',
        children: [
          { path: 'dart-defectstroke', component: DefectStrokeComponent },
          { path: 'dart-routine', component: RoutineComponent },
          { path: 'drt-chart', component: DrtChartComponent },
        ],
      },
      { path: 'dart-reports', component: DartReportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DartRoutingModule {}
