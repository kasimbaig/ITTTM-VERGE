import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../services/toast.service';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';
import { ExportService } from '../../services/export.service';
import { filterData } from '../../shared/utils/filter-helper';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
@Component({
  selector: 'app-address',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    ListboxModule,
    CommonModule,
    TieredMenuModule,
    PaginatedTableComponent,
    DropdownModule,
    ViewDetailsComponent,
    ToastComponent,
    ConfirmDialogComponent,
    AddFormComponent,
  ],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css',
})
export class AddressComponent {
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  @Input() tableName: string = 'Addrressee';
  editTitle: string = 'Edit Addressee';
  title: string = 'Add new Addressee';
  viewDetialsTitle: string = 'Addressee';
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  isViewDetailsOpen: boolean = false;
  showConfirmDialog: boolean = false;

  searchText: string = '';
  maintopDeatils: any = [];
  maintopAddressee: any[] = [];
  filteredAddresse: any[] = [];

  newDetails = {
    name: '',
    active: 1,
  };

  selectedDetails: any = {
    active: 1,
  };

  formConfigForNewDetails = [
    {
      label: 'Name',
      key: 'name',
      type: 'text',
      required: true,
    },
  ];
  cols = [{ field: 'name', header: 'Name' }];
  exportOptions = [
    {
      label: 'Export as PDF',
      icon: 'pi pi-file-pdf',
      command: () => this.exportPDF(),
    },
    {
      label: 'Export as Excel',
      icon: 'pi pi-file-excel',
      command: () => this.exportExcel(),
    },
  ];
  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.getDetails();
  }
  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }

  getDetails(): void {
    this.apiService.get<any[]>('maintop/addressee/').subscribe({
      next: (data) => {
        this.maintopAddressee = data;
        this.filteredAddresse = [...this.maintopAddressee];
      },
      error: (error) => {
        console.error('Error fetching maintop details:', error);
      },
    });
  }

  handleSubmit(details: any) {
    this.selectedDetails = { ...this.selectedDetails, ...details };

    this.apiService.post(`maintop/addressee/`, this.selectedDetails).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Successfully added new addressee');
        this.maintopAddressee.unshift(data);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.toastService.showError('Failed to add new Addressee');
      },
    });
  }
  viewDetails(address: any, open: boolean) {
    this.selectedDetails = address;
    this.isViewDetailsOpen = open;
  }
  editDetails(address: any, open: boolean) {
    this.selectedDetails = { ...address };
    this.isEditFormOpen = open;
  }

  deleteDetails(address: any) {
    this.selectedDetails = address;
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/addressee/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('Addressee deleted successfully');
          this.maintopAddressee = [
            ...this.maintopAddressee.filter(
              (item: any) => item.id !== this.selectedDetails.id
            ),
          ];
          this.filteredAddresse = [
            ...this.filteredAddresse.filter(
              (item: any) => item.id !== this.selectedDetails.id
            ),
          ];
        },
        error: (error) => {
          console.error('Error:', error);
        },
      });
  }
  resetFilters() {
    this.searchText = '';
    this.selectedDetails = {};

    this.newDetails = {
      name: '',
      active: 1,
    };
  }
  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  handleEditSubmit(details: any) {
    this.selectedDetails = { ...this.selectedDetails, ...details };
    this.apiService
      .put(
        `maintop/addressee/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (data: any) => {
          this.toastService.showSuccess('Successfully Updated Addressee');
          const index = this.maintopAddressee.findIndex(
            (item: any) => item.id === data.id
          );

          if (index !== -1) {
            this.maintopAddressee[index] = {
              ...this.maintopAddressee[index],
              ...data,
            };
          }
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Filed to Add Addrressee');
        },
      });
  }

  filterHeaders() {
    this.maintopAddressee = filterData(this.filteredAddresse, this.searchText, [
      'title',
      'code',
    ]);
  }

  exportExcel() {
    this.exportService.exportExcel(
      this.cols,
      this.maintopAddressee,
      this.tableName
    );
  }
  exportPDF() {
    this.exportService.exportPDF(
      this.cols,
      this.maintopAddressee,
      this.tableName
    );
  }
}
