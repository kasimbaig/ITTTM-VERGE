import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SararMainComponentComponent } from './sarar-main-component/sarar-main-component.component';
import { SararDashboardComponent } from './sarar-dashboard/sarar-dashboard.component';
import { EquipmentComponent } from './SARARMASTER/equipment/equipment.component';
import { FptCstFormComponent } from './SARARMASTER/fpt-cst-form/fpt-cst-form.component';
import { LinkedEquipmentComponent } from './SARARMASTER/linked-equipment/linked-equipment.component';
import { LubricantComponent } from './SARARMASTER/lubricant/lubricant.component';
import { ShipActivityDetailComponent } from './SARARMASTER/ship-activity-detail/ship-activity-detail.component';
import { ShipActivityTypeComponent } from './SARARMASTER/ship-activity-type/ship-activity-type.component';
import { ShipLocationComponent } from './SARARMASTER/ship-location/ship-location.component';
import { ShipStateComponent } from './SARARMASTER/ship-state/ship-state.component';
import { SararAdjustmentComponent } from './SARARTRANSACTION/sarar-adjustment/sarar-adjustment.component';
import { SararMonthlyComponent } from './SARARTRANSACTION/sarar-monthly/sarar-monthly.component';
import { SararStatusComponent } from './SARARTRANSACTION/sarar-status/sarar-status.component';
import { SrarReportComponent } from './srar-report/srar-report.component';
import { GraphQLComponent } from './SARARTRANSACTION/graph-ql/graph-ql.component';
import { ElasticSearchComponent } from './SARARTRANSACTION/elastic-search/elastic-search.component';

const routes: Routes = [
  {
    path:'',
    component:SararMainComponentComponent,
    children:[
      {
        path:'',
        component:SararDashboardComponent
      },
      {
        path:'srar-dashboard',
        component:SararDashboardComponent
      },
      { path:'sarar-master',
        children:[
          {  path:'sarar/master-equipment',  component:EquipmentComponent},
          {  path:'sarar/master-fpt-cst-form',  component:FptCstFormComponent},
          {  path:'sarar/master-linked-equipment',  component:LinkedEquipmentComponent},
          {  path:'sarar/master-lubricant',  component:LubricantComponent},
          {  path:'sarar/master-ship-activity-detail',  component:ShipActivityDetailComponent},
          {  path:'sarar/master-ship-activity-type',  component:ShipActivityTypeComponent},
          {  path:'sarar/master-ship-location',  component:ShipLocationComponent },
          {  path:'sarar/master-ship-state',  component:ShipStateComponent },
          
        ]
      },
      { path:'sarar-transaction',
        children:[
          { path:'sarar/transaction-adjustment', component:SararAdjustmentComponent},
          { path:'sarar/transaction-monthly', component:SararMonthlyComponent},
          { path:'sarar/transaction-status', component:SararStatusComponent},
          { path:'sarar/transaction-graphql', component:GraphQLComponent},
          { path:'sarar/transaction-elastic-search', component:ElasticSearchComponent},
        ]
      },
      { path:'srar-reports',
        component:SrarReportComponent
      }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SrarRoutingModule { }
