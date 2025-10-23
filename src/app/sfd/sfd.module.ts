import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SfdRoutingModule } from './sfd-routing.module';
import { TableComponent } from '../shared/components/table/table.component';
// Import hammerjs and chartjs-plugin-zoom here
import 'hammerjs';
import 'chartjs-plugin-zoom'; // This registers the plugin globally
import { NgChartsModule } from 'ng2-charts';
import { SfdTransactionModule } from './sfd-transaction/sfd-transaction.module';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    SfdRoutingModule,
    TableComponent,
    NgChartsModule, // Make sure ng2-charts is imported
    SfdTransactionModule
  ]
})
export class SfdModule { }
