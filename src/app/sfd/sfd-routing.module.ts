import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import the SFD Main Component (container)

// Import the SFD sub-components that will be rendered inside SfdMainComponentComponent's router-outlet
import { SfdDashboardComponent } from './sfd-dashboard/sfd-dashboard.component';
import { SfdReportsComponent } from './sfd-reports/sfd-reports.component';
// import { SfdTransactionsComponent } from './sfd-transactions/sfd-transactions.component';
import { ShipUserDashboardComponent } from './ship-user-dashboard/ship-user-dashboard.component';
import { SfdMainComponentComponent } from './sfd-main-component/sfd-main-component.component';
import { SfdCommonEquipmentComponentComponent } from './sfd-common-equipment-component/sfd-common-equipment-component.component';
import { AttechSfdByRefrenceComponent } from './sfd-transaction/attech-sfd-by-refrence/attech-sfd-by-refrence.component';
import { SfdListComponent } from './sfd-transaction/sfd-list/sfd-list.component';
import { EquipmentShipDetailsComponent } from './sfd-transaction/equipment-ship-details/equipment-ship-details.component';
import { ShipEquipmentDetailsComponent } from './sfd-transaction/ship-equipment-doc-details/ship-equipment-details.component';
import { DocumentDetailsComponent } from './sfd-transaction/ship-equipment-doc-details/document-details/document-details.component';
import { SfdChangeRequestComponent } from './sfd-transaction/sfd-change-request/sfd-change-request.component';
import { SfdApproveRequestComponent } from './sfd-transaction/sfd-approve-request/sfd-approve-request.component';
import { EquipmentHierarchyComponent } from './sfd-transaction/equipment-hierarchy/equipment-hierarchy.component';
import { EqptNomenclatureLocationComponent } from './sfd-transaction/eqpt-nomenclature-location/eqpt-nomenclature-location.component';


const routes: Routes = [
  {
    path: '', // This path corresponds to '/sfd' from the AppRoutingModule
    component: SfdMainComponentComponent, // This is the container component for all SFD sub-sections
    children: [
      // KEY CHANGE: This route makes SfdDashboardComponent the default content
      // when the URL is exactly '/sfd', without changing the URL to '/sfd/sfd-dashboard'.
      { path: '', component: SfdDashboardComponent },

      // SFD Dashboard (explicit path for direct access to /sfd/sfd-dashboard if desired)
      // Keeping this allows /sfd/sfd-dashboard to also work and be a valid URL.
      { path: 'sfd-dashboard', component: SfdDashboardComponent },

      // SFD Masters (lazy-loaded module for detailed master data pages)
      {
        path: 'sfd-masters',
        loadChildren: () => import('./sfd-master/sfd-master.module').then(m => m.SfdMasterModule)
      },
      {
        path: 'sfd-transactions',
        children: [
          { path: 'attach-sfd-by-reference', component: AttechSfdByRefrenceComponent },
          { path: 'sfd-list', component: SfdListComponent },
          { path: 'equipment-ship-details', component: EquipmentShipDetailsComponent },
          { path: 'ship-equipment-doc-details', component: ShipEquipmentDetailsComponent },
          { path: 'document-details', component: DocumentDetailsComponent },
          { path: 'sfd-change-request', component: SfdChangeRequestComponent },
          { path: 'sfd-approve-removal-change-request', component: SfdApproveRequestComponent },
          { path: 'equipment-hierarchy', component: EquipmentHierarchyComponent },
          { path: 'eqpt-nomenclature-location', component: EqptNomenclatureLocationComponent },
        ]
      },
      // SFD Reports
      { path: 'sfd-reports', component: SfdReportsComponent },

      // SFD Transactions
      // { path: 'transactions', component: SfdTransactionsComponent },

      // If ShipUserDashboardComponent is an SFD-specific dashboard
      { path: 'ship-user-dashboard', component: ShipUserDashboardComponent },
      { path: 'sfddash', redirectTo: 'ship-user-dashboard', pathMatch: 'full' },
      { path: 'sfddash2', redirectTo: 'ship-user-dashboard', pathMatch: 'full' },
    ]
  },
  // Ensure no other top-level routes for SFD components exist here,
  // as they would bypass SfdMainComponentComponent.
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SfdRoutingModule { }
