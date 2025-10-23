import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaintopRoutingModule } from './maintop-routing.module';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { TieredMenuModule } from 'primeng/tieredmenu';

import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { AddFormComponent } from '../shared/components/add-form/add-form.component';

import { ToastService } from '../services/toast.service';
import { PaginatedTableComponent } from '../shared/components/paginated-table/paginated-table.component';
import { ViewDetailsComponent } from '../shared/components/view-details/view-details.component';
import { ToastComponent } from '../shared/components/toast/toast.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    ListboxModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ViewDetailsComponent,
    ToastComponent,
    ConfirmDialogComponent,
    AddFormComponent,
    MaintopRoutingModule,
  ],

  exports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    ListboxModule,
    TieredMenuModule,
    PaginatedTableComponent,
    ViewDetailsComponent,
    ToastComponent,
    ConfirmDialogComponent,
    AddFormComponent,
  ],
  providers: [ToastService],
})
export class MaintopModule {}
