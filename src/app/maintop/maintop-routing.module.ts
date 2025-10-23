import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaintopHeaderComponent } from './maintop-header/maintop-header.component';
import { MaintopDetailsComponent } from './maintop-details/maintop-details.component';
import { MaintopJicComponent } from './maintop-jic/maintop-jic.component';
import { JicSpareComponent } from './jic-spare/jic-spare.component';
import { JicToolComponent } from './jic-tool/jic-tool.component';
import { AddressComponent } from './address/address.component';
import { JicAttachmentComponent } from './jic-attachment/jic-attachment.component';
import { LibraryDistDetailComponent } from './library-dist-detail/library-dist-detail.component';
import { LibraryDistComponent } from './library-dist/library-dist.component';
import { TransactionComponent } from './transaction/transaction.component';
import { DistributionAddressComponent } from './distribution-address/distribution-address.component';
import { DashChart1Component } from './dash-chart1/dash-chart1.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MaintopDashboardComponent } from './maintop-dashboard/maintop-dashboard.component';
import { MaintopMainComponent } from './maintop-main/maintop-main.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: MaintopMainComponent,
//     children: [
//       { path: '', redirectTo: 'dashmaintop', pathMatch: 'full' },
//       { path: 'dashmaintop', component: MaintopDashboardComponent },
//       { path: 'maintopheader', component: MaintopHeaderComponent },
//       { path: 'maintopdetails', component: MaintopDetailsComponent },
//       { path: 'maintopJic', component: MaintopJicComponent },
//       { path: 'jicSpare', component: JicSpareComponent },
//       { path: 'jicTool', component: JicToolComponent },
//       { path: 'addresse', component: AddressComponent },
//       { path: 'jicAttachment', component: JicAttachmentComponent },
//       { path: 'libraryDistDetail', component: LibraryDistDetailComponent },
//       { path: 'libraryDist', component: LibraryDistComponent },
//       { path: 'maintopTransaction', component: TransactionComponent },
//       { path: 'distributionAddress', component: DistributionAddressComponent },
//     ],
//   },
// ];

const routes: Routes = [
  {
    path: '',
    component: MaintopMainComponent,
    children: [
      { path: '', redirectTo: 'dashmaintop', pathMatch: 'full' },
      { path: 'dashmaintop', component: MaintopDashboardComponent },
      {
        path: 'maintop-master',
        children: [
          { path: 'maintop-header', component: MaintopHeaderComponent },
          { path: 'maintop-details', component: MaintopDetailsComponent },
          { path: 'maintop-jic', component: MaintopJicComponent },
          { path: 'maintop-jic-spare', component: JicSpareComponent },
          { path: 'maintop-jic-tool', component: JicToolComponent },
          { path: 'maintop-address', component: AddressComponent },
          { path: 'maintop-jic-attachment', component: JicAttachmentComponent },
          { path: 'maintop-library-dist-detail', component: LibraryDistDetailComponent },
          { path: 'maintop-library-dist', component: LibraryDistComponent },
        ],
      },
      {
        path: 'transaction',
        children: [
          { path: 'maintop-transaction', component: TransactionComponent },
          { path: 'maintop-distribution-address', component: DistributionAddressComponent },
        ],
      },
      // { path: 'maintop-reports', component: MaintopReportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaintopRoutingModule {}
