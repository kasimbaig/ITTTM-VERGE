import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog, DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CommonModule, Location } from '@angular/common';

import { CommandService } from '../ship-services/command.service'; // Correct path
import { SectionService } from '../ship-services/section.service'; // Correct path
import { FileUploadModule } from 'primeng/fileupload';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { catchError, of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner'; // Import ProgressSpinnerModule for loading indicator
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';
import { ViewDetailsComponent } from '../../../shared/components/view-details/view-details.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-section',
  standalone: true,
  imports: [
    DialogModule,
    TableModule,
    AddFormComponent,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DropdownModule,
    TieredMenuModule,
    PaginatedTableComponent,
    CommonModule,
    ToastComponent, // Make sure ToastComponent is imported
    FileUploadModule,
    DeleteConfirmationModalComponent,
    ViewDetailsComponent,
    ProgressSpinnerModule // For the loading spinner
  ],
  // IMPORTANT: Provide ToastService here so it can be injected and used by ToastComponent
  providers: [ToastService],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css',
})
export class SectionComponent implements OnInit {
  searchText: string = '';
  sections: any = [];
  isFormOpen: boolean = false;
  title: string = 'Add new section';
  isBulkUploadPopup: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit section';
  isDeleteConfirmationVisible: boolean = false;
  isLoading: boolean = false; // Property to control loading spinner visibility

  isViewDetailsOpen: boolean = false;
  detailsForViewComponent: any = {};
  viewDetailsTitle: string = 'Section Details';

  newDetails: any;

  selectedDetails: any = {
    active: true,
  };

  formConfigForNewDetails: any[];

  filteredCommands: any[] = [];

  // New properties for pagination
  apiUrl: string = 'master/section/';
  totalCount: number = 0;

  constructor(
    private toastService: ToastService, // Inject ToastService
    private location: Location,
    private commandService: CommandService,
    private sectionService: SectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.formConfigForNewDetails = [
      {
        label: 'Section Name',
        key: 'name',
        type: 'text',
        required: true,
      },
      {
        label: 'Section Code',
        key: 'code',
        type: 'text',
        required: true,
      },
      {
        label: 'Section Command',
        key: 'command',
        type: 'select',
        options: this.filteredCommands, // Options will be loaded dynamically
        required: true,
      },
      {
        label: 'Status',
        key: 'active',
        type: 'checkbox',
        required: false,
        placeholder: 'Active',
      },
    ];

    this.resetNewDetails();
  }

  ngOnInit(): void {

    // Load master data for dropdowns (but not sections data - paginated table will handle that)
    this.loadCommandOptions();
    
    // Note: Table data will be loaded by the paginated table component
    // No need to call getSections() here
  }

  resetNewDetails() {
    this.newDetails = {
      code: '',
      name: '',
      command_name: null,
      sfd_hierarchy: null, // Added sfd_hierarchy and defaulted to null
      active: true, // Default to active
    };
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
    if (open) {
      this.resetNewDetails();
    }
  }

  getSections(): void {
    this.isLoading = true;
  
    this.sectionService.getSections().subscribe({
      next: (data: any) => {  // ✅ make sure it's `any`, not `any[]`
        const sections = (data?.results || []) as any[]; // ✅ ensure it's treated as an array
  
      
  
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching sections:', error);
        this.toastService.showError('Failed to fetch sections.');
        this.isLoading = false;
      },
    });
  }
  
  

  handleSubmit(data: any) {
    this.isLoading = true; // Show loading spinner
    const payload = { ...data };

    // Ensure command is sent as just the ID if it's an object from the dropdown
    if (payload.command && typeof payload.command === 'object' && payload.command.value) {
      payload.command = payload.command.value;
    } else if (payload.command === '') {
      payload.command = null;
    }
    payload.active = Number(1);

    // Explicitly add sfd_hierarchy as null
    payload.sfd_hierarchy = null;

    this.sectionService.addSection(payload).subscribe({
      next: (response: any) => {
        this.toastService.showSuccess('Section added successfully!'); // Show success message
        this.closeDialog();
        this.isLoading = false; // Hide loading spinner on success
      },
      error: (error) => {
        console.error('Error adding section:', error);
        let errorMessage = 'Failed to add section.';
        if (error.error && typeof error.error === 'object') {
          // Attempt to extract specific error messages from the backend response
          const errorMessages = Object.values(error.error).flat();
          // Check for specific "Code already exists" error
          if (errorMessages.some((msg: any) => typeof msg === 'string' && msg.includes('section with this code already exists'))) {
            errorMessage = 'Code: A section with this code already exists.';
          } else {
            errorMessage = errorMessages.join(' ');
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        this.toastService.showError(`Error: ${errorMessage}`); // Show error message
        this.isLoading = false; // Hide loading spinner on error
      },
    });
  }

  deleteSectionDetails(details: any) {
    this.selectedDetails = details;
    this.isDeleteConfirmationVisible = true;
  }

  confirmDeletion() {
    if (this.selectedDetails?.id) {
      this.isLoading = true; // Show loading spinner
      const payload = { id: this.selectedDetails.id, delete: true };
      this.sectionService.postSection(payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Section deleted successfully!'); // Show success message
          this.closeDialog();
          this.isLoading = false; // Hide loading spinner on success
        },
        error: (error: any) => {
          console.error('Error deleting section:', error);
          let errorMessage = 'Failed to delete section.';
          if (error.error && typeof error.error === 'object') {
            errorMessage = Object.values(error.error).flat().join(' ');
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.toastService.showError(`Error: ${errorMessage}`); // Show error message
          this.closeDialog();
          this.isLoading = false; // Hide loading spinner on error
        },
      });
    }
  }

  handleEditSubmit(data: any) {
    this.isLoading = true; // Show loading spinner
    const payload = { ...data };

    // Ensure command is sent as just the ID if it's an object from the dropdown
    if (payload.command && typeof payload.command === 'object' && payload.command.value) {
      payload.command = payload.command.value;
    } else if (payload.command === '') {
      payload.command = null;
    }

    // Set 'active' to 1 or 0 (number) using Number() for robust conversion
    // This will convert boolean true/false, or string "1"/"0" to the desired 1 or 0 integer.
    payload.active = Number(payload.active);

    // Explicitly add sfd_hierarchy as null (or retain existing if it's an edit)
    // For simplicity, setting to null here. If sfd_hierarchy can be edited,
    // it would need to be part of formConfig and formData.
    payload.sfd_hierarchy = null;

    if (this.selectedDetails?.id) {
      // Add id to payload for POST method with action key
      payload.id = this.selectedDetails.id;
      this.sectionService.postSection(payload).subscribe({
        next: () => {
          this.toastService.showSuccess('Section updated successfully!'); // Show success message
          this.closeDialog();
          this.isLoading = false; // Hide loading spinner on success
        },
        error: (error: any) => {
          console.error('Error updating section:', error);
          let errorMessage = 'Failed to update section.';
          if (error.error && typeof error.error === 'object') {
            // Attempt to extract specific error messages from the backend response
            const errorMessages = Object.values(error.error).flat();
            // Check for specific "Code already exists" error
            if (errorMessages.some((msg: any) => typeof msg === 'string' && msg.includes('section with this code already exists'))) {
              errorMessage = 'Code: A section with this code already exists.';
            } else {
              errorMessage = errorMessages.join(' ');
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.toastService.showError(`Error: ${errorMessage}`); // Show error message
          this.isLoading = false; // Hide loading spinner on error
        },
      });
    }
  }

  goBack() {
    this.location.back();
  }

  loadCommandOptions(): void {
    this.commandService.getCommandOptions().subscribe({
      next: (commands) => {
        this.filteredCommands = commands;
        const commandField = this.formConfigForNewDetails.find(
          (field) => field.key === 'command'
        );
        if (commandField) {
          commandField.options = this.filteredCommands;
        }
      },
      error: (error: any) => {
        console.error('Error loading command options:', error);
        this.toastService.showError('Failed to load command options.'); // Show error message
      },
    });

    this.commandService.loadAllCommandsData();
  }

  filterSections() {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.getSections(); // Reload all sections if search is empty
      return;
    }
    this.isLoading = true; // Show loading spinner for filter
    this.sectionService.getSections().subscribe({
      next: (data: any[]) => {
        this.sections = data.map((section) => ({
          ...section,
          command_name: section.command?.name || 'N/A',
          active_status: section.active === 1 ? 'Y' : 'N',
        })).filter(
          (section: { name: string; code: string; command_name: string }) =>
            section.name.toLowerCase().includes(search) ||
            section.code.toLowerCase().includes(search) ||
            section.command_name.toLowerCase().includes(search)
        );
        this.isLoading = false; // Hide loading spinner
      },
      error: (error) => {
        console.error('Error fetching sections for filter:', error);
        this.toastService.showError('Failed to filter sections.'); // Show error message
        this.isLoading = false; // Hide loading spinner
      }
    });
  }

  handleBulkUpload(event: any) {
    this.toastService.showSuccess('File uploaded successfully!'); // Show success message
    this.isBulkUploadPopup = false;
    this.getSections();
  }

  closeDialog() {
    this.isDeleteConfirmationVisible = false;
    this.isEditFormOpen = false;
    this.isFormOpen = false;
    this.isBulkUploadPopup = false;
    this.isViewDetailsOpen = false;
    this.selectedDetails = { active: true };
    this.resetNewDetails();
    this.getSections(); // Refresh data after any action
  }

  viewDetails(details: any) {
    this.detailsForViewComponent = { ...details };
    this.isViewDetailsOpen = true;
  }

  editDetails(details: any) {
    this.selectedDetails = {
      ...details,
      // This logic correctly maps the command object to a value the dropdown expects (the command ID)
      command: this.filteredCommands.find(c => c.value === details.command?.id || c.value === details.command) || null,
    };
    this.isEditFormOpen = true;
  }

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

  cols = [
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'name', header: 'Name', filterType: 'text' },
    { field: 'command.name', header: 'Command', filterType: 'text' },
    { field: 'active', header: 'Active', filterType: 'text' },
  ];

  @ViewChild('dt') dt!: Table;
  value: number = 0;
  stateOptions: any[] = [
    { label: 'Equipment Specification', value: 'equipment' },
    { label: 'HID Equipment', value: 'hid' },
    { label: 'Generic Specification', value: 'generic' },
  ];
  tabvalue: string = 'equipment';
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();

  // tableName is an Input, so it should be available.
  @Input() tableName: string = 'sections';

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    //console.log('🚢 Data loaded from paginated table:', data);
    //console.log('🚢 Data length:', data?.length);
    //console.log('🚢 Data type:', typeof data);
    //console.log('🚢 First record:', data?.[0]);
    
    this.sections = data || [];
    
    //console.log('🚢 Sections array updated:', this.sections);
    
    // Force change detection
    this.cdr.detectChanges();
  }

  exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.sections.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'command.name') {
            return row['command']?.name || 'N/A';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`);
    this.toastService.showSuccess('Exported as PDF successfully!'); // Show success message
  }

  exportExcel() {
    const headers = this.cols.map((col) => col.header);
    const rows = this.sections.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.field === 'command.name') {
          return row['command']?.name || 'N/A';
        }
        return row[col.field] || '';
      })
    );
    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.toastService.showSuccess('Exported as Excel successfully!'); // Show success message
  }
}
