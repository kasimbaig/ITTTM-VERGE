import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SrarRoutingModule } from './srar-routing.module';
import { SararDashboardComponent } from './sarar-dashboard/sarar-dashboard.component';
import { SararMainComponentComponent } from './sarar-main-component/sarar-main-component.component';
import { EquipmentComponent } from './SARARMASTER/equipment/equipment.component';
import { FptCstFormComponent } from './SARARMASTER/fpt-cst-form/fpt-cst-form.component';
import { LinkedEquipmentComponent } from './SARARMASTER/linked-equipment/linked-equipment.component';
import { LubricantComponent } from './SARARMASTER/lubricant/lubricant.component';
import { ShipActivityDetailComponent } from './SARARMASTER/ship-activity-detail/ship-activity-detail.component';
import { ShipActivityTypeComponent } from './SARARMASTER/ship-activity-type/ship-activity-type.component';
import { ShipLocationComponent } from './SARARMASTER/ship-location/ship-location.component';
import { ShipStateComponent } from './SARARMASTER/ship-state/ship-state.component';
import { ResuableTableComponent } from '../sfd/sfd-transaction/resuable-table/resuable-table.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { SararAdjustmentComponent } from './SARARTRANSACTION/sarar-adjustment/sarar-adjustment.component';
import { SubComponentMonthlyComponent } from './SARARTRANSACTION/sarar-monthly/sub-component-monthly/sub-component-monthly.component';
import { OperationsModule } from './SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/operations.module';
import { DeleteConfirmationModalComponent } from '../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { SararMonthlyComponent } from './SARARTRANSACTION/sarar-monthly/sarar-monthly.component';
import { FinalPageComponent } from './SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/final-page/final-page.component';
import { SrarReportComponent } from './srar-report/srar-report.component';
import { ReportComponent } from './SARARTRANSACTION/sarar-monthly/sub-component-monthly/operations/report/report.component';
import { SararStatusComponent } from './SARARTRANSACTION/sarar-status/sarar-status.component';
import { GraphQLComponent } from './SARARTRANSACTION/graph-ql/graph-ql.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DartDashboardComponent } from '../dart/dart-dashboard/dart-dashboard/dart-dashboard.component';
@NgModule({
  declarations: [
    EquipmentComponent,
    FptCstFormComponent,  
    LinkedEquipmentComponent,
    LubricantComponent,
    ShipActivityDetailComponent,
    ShipActivityTypeComponent,
    ShipLocationComponent,
    ShipStateComponent,
    SararAdjustmentComponent,
    SararMonthlyComponent,
    SubComponentMonthlyComponent,
    SrarReportComponent,
    SararStatusComponent,
    GraphQLComponent
  ],

  imports: [
    SararDashboardComponent,
    ResuableTableComponent,
    DeleteConfirmationModalComponent,
    DartDashboardComponent,
    CommonModule,
    SrarRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    CheckboxModule,
    OperationsModule,
    ReportComponent,
    ToastModule
  ],
  providers:[MessageService]
})
export class SrarModule { }
