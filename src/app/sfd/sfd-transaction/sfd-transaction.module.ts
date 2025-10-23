import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { EqptNomenclatureLocationComponent } from './eqpt-nomenclature-location/eqpt-nomenclature-location.component';
import { EquipmentHierarchyComponent } from './equipment-hierarchy/equipment-hierarchy.component';
import { EquipmentShipDetailsComponent } from './equipment-ship-details/equipment-ship-details.component';
import { SfdApproveRequestComponent } from './sfd-approve-request/sfd-approve-request.component';
import { SfdChangeRequestComponent } from './sfd-change-request/sfd-change-request.component';
import { SfdListComponent } from './sfd-list/sfd-list.component';
import { ShipEquipmentDetailsComponent } from './ship-equipment-doc-details/ship-equipment-details.component';
import { ResuableTableComponent } from './resuable-table/resuable-table.component';
import { AttechSfdByRefrenceComponent } from './attech-sfd-by-refrence/attech-sfd-by-refrence.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DocumentDetailsComponent } from './ship-equipment-doc-details/document-details/document-details.component';
import { DeleteConfirmationModalComponent } from '../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';

@NgModule({
  declarations: [
    EqptNomenclatureLocationComponent,
    EquipmentHierarchyComponent,
    EquipmentShipDetailsComponent,
    SfdApproveRequestComponent,
    SfdChangeRequestComponent,
    SfdListComponent,
    ShipEquipmentDetailsComponent,
   
    AttechSfdByRefrenceComponent,
    DocumentDetailsComponent


  ],
  imports: [
    
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    ToastModule,
    MatMenuModule,
    MatButtonModule,
    CheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    ToastModule,
    ResuableTableComponent,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent
    
  ],

})
export class SfdTransactionModule { }
