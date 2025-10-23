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
import { Dialog } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ListboxModule } from 'primeng/listbox';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SelectButton } from 'primeng/selectbutton';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../shared/components/add-form/add-form.component';

// import { AddFormComponent } from '../../components/add-form/add-form.component';
import { ToastService } from '../../services/toast.service';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ViewDetailsComponent } from '../../shared/components/view-details/view-details.component';
interface CardOption {
  label: string;
  value: any;
}

interface Card {
  label: string;
  selectedOption: any; // or more specific type if needed
  options: CardOption[];
}
@Component({
  selector: 'app-library-dist-detail',
  imports: [
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
    AddFormComponent,
    ToastComponent,
    ConfirmDialogComponent,
    ViewDetailsComponent,
  ],
  templateUrl: './library-dist-detail.component.html',
  styleUrl: './library-dist-detail.component.css',
})
export class LibraryDistDetailComponent {
  isFormOpen: boolean = false;
  searchAmmendment: string = '';
  isEditFormOpen: boolean = false;
  showConfirmDialog: boolean = false;

  editTitle: string = 'Edit Library Dist Detail';
  title: string = 'Add new Library Dist Detail';
  viewDetialsTitle: string = 'Library Dist Detail';
  searchText: string = '';
  maintopDetails: any = [];
  isViewDetailsOpen: boolean = false;
  filteredDistributionAddress: any = [];
  filteredLibraryDist: any = [];

  handleSubmit(event: any) {
    this.newDetails = event;
    this.newDetails.active = 1;

    // Map the distribution address to its label before sending it to the API
    const matchedAddress = this.filteredDistributionAddress.find(
      (addr: any) => addr.value === this.newDetails.distribution_address
    );
    if (matchedAddress) {
      this.newDetails.distribution_address = matchedAddress.label;
    }

    this.apiService
      .post('maintop/maintop-library-dist-detail/', this.newDetails)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.toastService.showSuccess(
            'Library Dist Detail Added Successfully'
          );

          // Map the distribution_address after receiving the response data
          const responseAddress = this.filteredDistributionAddress.find(
            (addr: any) => addr.value === data.distribution_address
          );
          data.distribution_address = responseAddress
            ? responseAddress.label
            : data.distribution_address;

          this.maintopDetails.unshift(data);
        },
        error: (error) => {
          console.error('Login failed:', error);
          alert('Invalid login credentials');
        },
      });
    this.isFormOpen = false;
  }

  newDetails = {
    distribution_address: '',
    maintop_library_dist: '',
    active: 1,
  };

  formConfigForNewDetails = [
    {
      label: 'Distribution Address',
      key: 'distribution_address',
      type: 'select',
      options: this.filteredDistributionAddress,
      required: true,
    },
    {
      label: 'Maintop Libaray Dist',
      key: 'maintop_library_dist',
      type: 'select',
      options: this.filteredLibraryDist,
      required: true,
    },
  ];

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }
  toggleEditForm(open: boolean) {
    this.isEditFormOpen = open;
  }

  selectedActiveStatus: number = 1;
  selectedDepartment: any;

  selectedDetails: any = {
    active: 1,
  };
  filteredDetails: any = [];

  // filteredFrequencies: any = [];
  // filteredDepartments: any = [];
  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getDistributionAddressDetails();
    this.getMaintopLibraryDist();
    this.getDetails();
  }

  getDistributionAddressDetails(): void {
    this.apiService.get<any[]>('maintop/distribution-address/').subscribe({
      next: (data) => {
        //console.log(data);
        this.filteredDistributionAddress = data.map((details: any) => ({
          label: details.name,
          value: details.id,
        }));
        const distAddressField = this.formConfigForNewDetails.find(
          (field) => field.key === 'distribution_address'
        );

        if (distAddressField) {
          distAddressField.options = this.filteredDistributionAddress;
        }
        const DistributionAddressCardCard = this.cards.find(
          (card) => card.label === 'Distribution Addrress'
        );

        if (DistributionAddressCardCard) {
          DistributionAddressCardCard.options = data.map((eq) => ({
            label: eq.name,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
      },
    });
  }
  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Library Dist':
        this.onLibraryChange(value);
        break;
    }
  }
  cards: Card[] = [
    {
      label: 'Library Dist',
      selectedOption: null,
      options: [],
    },
  ];
  // onDistributionChange(equipmentId: any) {
  //   //console.log('ekjdj00');
  //   this.apiService
  //     .get<any[]>(`maintop/maintop-library-dist/?dropdown=${true}`)
  //     .subscribe((headers) => {
  //       //console.log(headers);

  //       this.filteredLibraryDist = headers;
  //       const libraryDistCardCard = this.cards.find(
  //         (card) => card.label === 'Library Dist'
  //       );

  //       if (libraryDistCardCard) {
  //         libraryDistCardCard.options = headers.map((eq) => ({
  //           label: eq.addressee,
  //           value: eq.id,
  //         }));
  //       }
  //     });
  // }
  onLibraryChange(equipmentId: any) {
    this.apiService
      .get<any[]>(`maintop/maintop-library-dist-detail/?dropdown=${true}`)
      .subscribe((headers) => {
        //console.log(headers);
        //console.log(this.filteredDistributionAddress);

        // Map through headers and replace distribution_address with label
        this.maintopDetails = headers.map((item) => {
          const matchedAddress = this.filteredDistributionAddress.find(
            (addr: any) => addr.value === item.distribution_address
          );

          return {
            ...item,
            distribution_address: matchedAddress
              ? matchedAddress.label
              : item.distribution_address,
          };
        });

        //console.log(this.maintopDetails);
      });
  }

  getMaintopLibraryDist(): void {
    this.apiService.get<any[]>('maintop/maintop-library-dist/').subscribe({
      next: (data) => {
        //console.log(data);
        this.filteredLibraryDist = data.map((details: any) => ({
          label: details.id,
          value: details.id,
        }));
        const distAddressField = this.formConfigForNewDetails.find(
          (field) => field.key === 'maintop_library_dist'
        );

        if (distAddressField) {
          distAddressField.options = this.filteredLibraryDist;
        }
        const LibraryDistCardCard = this.cards.find(
          (card) => card.label === 'Library Dist'
        );

        if (LibraryDistCardCard) {
          LibraryDistCardCard.options = data.map((eq) => ({
            label: eq.id,
            value: eq.id,
          }));
        }
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
      },
    });
  }

  getDetails(): void {
    this.apiService
      .get<any[]>('maintop/maintop-library-dist-detail/')
      .subscribe({
        next: (data) => {
          //console.log(data);
          // this.maintopDetails = data;
          this.filteredDetails = [...this.maintopDetails];
          // Create a lookup for department and equipment names
          const maintopJicMap = this.filteredDistributionAddress.reduce(
            (acc: any, header: any) => {
              acc[header.value] = header.label;
              return acc;
            },
            {}
          );

          // Map department ID and equipment ID to names in maintop details
          this.filteredDetails = data.map((item: any) => ({
            ...item,
            maintopJic: maintopJicMap[item.maintop_detail] || 'Unknown',
          }));

          // this.filteredDetails = this.maintopDetails;
        },
        error: (error) => {
          console.error('Error fetching maintop details:', error);
        },
      });
  }

  closeDialog() {
    this.selectedDetails = {};
  }

  viewDetails(details: any, open: boolean) {
    this.selectedDetails = { ...details };
    this.isViewDetailsOpen = open;
    //console.log(this.isViewDetailsOpen);
  }
  resetFilters() {
    this.cards.forEach((card) => {
      card.selectedOption = null;
      if (card.label !== 'Library Dist') {
        card.options = [];
      }
    });
    this.maintopDetails = [];
  }
  editDetails(details: any, open: boolean) {
    //console.log(details);

    this.selectedDetails = { ...details };
    this.isEditFormOpen = open;

    this.selectedDetails.date = this.formatDate(this.selectedDetails.date);
  }
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  }
  deleteDetails(details: any) {
    this.selectedDetails = details;
    this.showConfirmDialog = true;
  }
  confirmDeletion() {
    this.apiService
      .delete(`maintop/maintop-library-dist-detail/${this.selectedDetails.id}/`)
      .subscribe({
        next: (data: any) => {
          this.showConfirmDialog = false;
          this.toastService.showSuccess('Library dist deleted successfully');
          this.maintopDetails = [
            ...this.maintopDetails.filter(
              (item: any) => item.id !== this.selectedDetails.id
            ),
          ];
          this.filteredDetails = [
            ...this.filteredDetails.filter(
              (item: any) => item.id !== this.selectedDetails.id
            ),
          ];
          //console.log(this.maintopDetails);
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to delete');
        },
      });
    this.showConfirmDialog = false;
  }

  onConfirmDelete(confirmed: boolean): void {
    if (confirmed) this.confirmDeletion();
    else this.showConfirmDialog = false;
  }
  handleEditSubmit(data: any) {
    this.selectedDetails = { ...this.selectedDetails, ...data };
    this.selectedDetails.active = 1;

    const matchedAddress = this.filteredDistributionAddress.find(
      (addr: any) => addr.value === this.selectedDetails.distribution_address
    );
    if (matchedAddress) {
      this.selectedDetails.distribution_address = matchedAddress.label;
    }

    this.apiService
      .put(
        `maintop/maintop-library-dist-detail/${this.selectedDetails.id}/`,
        this.selectedDetails
      )
      .subscribe({
        next: (updatedData: any) => {
          // Replace distribution_address in updatedData with its label before updating UI
          const responseAddress = this.filteredDistributionAddress.find(
            (addr: any) => addr.value === updatedData.distribution_address
          );

          if (responseAddress) {
            updatedData.distribution_address = responseAddress.label;
          }
          //console.log(updatedData);

          const index = this.maintopDetails.findIndex(
            (item: any) => item.id === updatedData.id
          );

          if (index !== -1) {
            this.maintopDetails[index] = {
              ...this.maintopDetails[index],
              ...updatedData,
              distribution_address: updatedData.distribution_address, // make sure it's label
            };
          }

          this.filteredDetails = [...this.maintopDetails]; // trigger re-render
          this.toastService.showSuccess(
            'Library dist detail updated successfully!'
          );
          this.isEditFormOpen = false;
        },
        error: (error) => {
          console.error('Error:', error);
          this.toastService.showError('Failed to update Library dist detail');
        },
      });
  }

  cols = [
    { field: 'distribution_address', header: 'Distribution Address' },
    { field: 'maintop_library_dist', header: 'Library dist' },
    // { field: 'maintop_library_dist.department.name', header: 'Department' },
    // { field: 'no_of_fits', header: 'No. of Fits' }
  ];
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
  @ViewChild('dt') dt!: Table;
  value: number = 0;

  tabvalue: string = 'equipment';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  exportPDF() {
    //console.log('Exporting as PDF...');
    // Your PDF export logic here
    this.exportPDFEvent.emit(); // Emit event instead of direct call
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.maintopDetails.map((row: { [x: string]: any }) =>
        this.cols.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`); // ✅ Use backticks
  }
  @Input() tableName: string = '';
  exportExcel() {
    //console.log('Exporting as Excel...');
    // Your Excel export logic here
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.cols.map((col) => col.header);
    const rows = this.maintopDetails.map((row: { [x: string]: any }) =>
      this.cols.map((col) => row[col.field] || '')
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }
  filterDepartments() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.maintopDetails = [...this.filteredDetails]; // Reset to original list if search is empty
      return;
    }

    this.maintopDetails = this.filteredDetails.filter(
      (dept: { name: string; code: string }) =>
        dept.name.toLowerCase().includes(search) ||
        dept.code.toLowerCase().includes(search)
    );
  }
}
