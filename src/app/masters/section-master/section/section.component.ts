import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AddFormComponent } from '../../../shared/components/add-form/add-form.component';
import { CommonModule, Location } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { PaginatedTableComponent } from '../../../shared/components/paginated-table/paginated-table.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { DeleteConfirmationModalComponent } from '../../../shared/components/delete-confirmation-modal/delete-confirmation-modal.component';

interface TrialUnit {
  id: number;
  name: string;
  code: string;
  description: string;
  sequence: number;
  active: number;
  created_on: string;
  created_ip: string;
  modified_on: string;
  modified_ip: string;
  created_by: number;
  modified_by: number;
}

interface Command {
  id: number;
  name: string;
}

interface Section {
  id: number;
  trial_unit: TrialUnit | null;
  command: Command | null;
  name: string;
  description: string;
  code: string;
  sequence: number;
  status: number;
  created_on: string;
  created_ip: string;
  modified_on: string;
  modified_ip: string;
  created_by: number;
  modified_by: number;
}

@Component({
  selector: 'app-section',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    TieredMenuModule,
    PaginatedTableComponent,
    AddFormComponent,
    CommonModule,
    ToastComponent,
    DeleteConfirmationModalComponent
  ],
  templateUrl: './section.component.html',
  styleUrl: './section.component.css'
})
export class SectionComponent implements OnInit {
  searchText: string = '';
  sections: Section[] = [];
  trialUnits: TrialUnit[] = [];
  commands: Command[] = [];
  selectedTrialUnitId: number | null = null;
  isLoadingTrialUnits: boolean = false;
  isLoadingCommands: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Section Master';
  title: string = 'Add New Section Master';
  
  newSection = {
    trial_unit: null,
    command: null,
    name: '',
    description: '',
    code: '',
    sequence: 1,
    status: 1,
  };
  
  selectedSection: Section = {
    id: 0,
    trial_unit: null,
    command: null,
    name: '',
    description: '',
    code: '',
    sequence: 1,
    status: 1,
    created_on: '',
    created_ip: '',
    modified_on: '',
    modified_ip: '',
    created_by: 0,
    modified_by: 0
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Trial Unit',
      key: 'trial_unit',
      type: 'select',
      required: true,
      options: [],
      onChange: (value: any) => this.handleTrialUnitChange(value)
    },
    {
      label: 'Command',
      key: 'command',
      type: 'select',
      required: true,
      options: []
    },
    {
      label: 'Section Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Description',
      key: 'description',
      type: 'textarea',
      required: false,
    },
    {
      label: 'Code',
      key: 'code',
      type: 'text',
      required: false,
    },
    {
      label: 'Sequence',
      key: 'sequence',
      type: 'number',
      required: true,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredSections: Section[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/section/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchTrialUnits();
    this.fetchCommands();
    // Note: Table data will be loaded by the paginated table component
  }

  goBack() {
    this.location.back();
  }

  getSections(): void {
    this.apiService.get<any>('master/section/').subscribe({
      next: (response) => {
        if (response && response.results) {
          this.sections = response.results;
          this.filteredSections = [...this.sections];
        } else {
          this.sections = response;
          this.filteredSections = [...this.sections];
        }
      },
      error: (error) => {
        console.error('Error fetching sections:', error);
      },
    });
  }

  fetchTrialUnits(): void {
    this.isLoadingTrialUnits = true;
    this.apiService.get<any>('master/trial-units/').subscribe({
      next: (response) => {
        // Handle different response formats
        let trialUnitsData = [];
        if (response && response.data) {
          trialUnitsData = response.data;
        } else if (response && response.results) {
          trialUnitsData = response.results;
        } else if (Array.isArray(response)) {
          trialUnitsData = response;
        }
        
        this.trialUnits = trialUnitsData;
        
        // Update form config with trial unit options for dropdown
        this.formConfigForNewDetails[0].options = this.trialUnits.map(trialUnit => ({
          value: trialUnit.id,
          label: trialUnit.name
        }));
      },
      error: (error) => {
        console.error('Error fetching trial units:', error);
        this.toastService.showError('Failed to load trial units');
        this.trialUnits = [];
      },
      complete: () => {
        this.isLoadingTrialUnits = false;
      }
    });
  }

  fetchCommands(): void {
    this.isLoadingCommands = true;
    this.apiService.get<any>('master/command/').subscribe({
      next: (response) => {
        // Handle different response formats
        let commandsData = [];
        if (response && response.data) {
          commandsData = response.data;
        } else if (response && response.results) {
          commandsData = response.results;
        } else if (Array.isArray(response)) {
          commandsData = response;
        }
        
        this.commands = commandsData;
        
        // Update form config with command options for dropdown
        this.formConfigForNewDetails[1].options = this.commands.map(command => ({
          value: command.id,
          label: command.name
        }));
      },
      error: (error) => {
        console.error('Error fetching commands:', error);
        this.toastService.showError('Failed to load commands');
        this.commands = [];
      },
      complete: () => {
        this.isLoadingCommands = false;
      }
    });
  }

  handleTrialUnitChange(trialUnitId: number): void {
    this.selectedTrialUnitId = trialUnitId;
    // You can add logic here to filter commands based on trial unit if needed
  }

  // Search function
  filterSections() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.sections = [...this.filteredSections];
      return;
    }

    this.sections = this.filteredSections.filter(
      (section: Section) =>
        section.name.toLowerCase().includes(search) ||
        (section.code && section.code.toLowerCase().includes(search)) ||
        (section.description && section.description.toLowerCase().includes(search)) ||
        (section.trial_unit?.name && section.trial_unit.name.toLowerCase().includes(search)) ||
        (section.command?.name && section.command.name.toLowerCase().includes(search))
    );
  }

  openAddSection() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedSection = {
      id: 0,
      trial_unit: null,
      command: null,
      name: '',
      description: '',
      code: '',
      sequence: 1,
      status: 1,
      created_on: '',
      created_ip: '',
      modified_on: '',
      modified_ip: '',
      created_by: 0,
      modified_by: 0
    };
    this.selectedTrialUnitId = null;
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Section name is required');
      return;
    }

    if (!data.trial_unit) {
      this.toastService.showError('Trial Unit is required');
      return;
    }

    if (!data.command) {
      this.toastService.showError('Command is required');
      return;
    }

    const payload = {
      trial_unit: parseInt(data.trial_unit),
      command: parseInt(data.command),
      name: data.name,
      description: data.description || '',
      code: data.code || '',
      sequence: parseInt(data.sequence) || 1,
      status: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/section/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Section added successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err?.error?.error || 'Something went wrong';
        this.toastService.showError(errorMsg);
      },
    });
  }

  toggleForm(open: boolean) {
    this.isFormOpen = open;
  }

  viewSectionDetails(section: Section) {
    this.viewdisplayModal = true;
    this.selectedSection = section;
  }

  editSectionDetails(section: Section) {
    this.isEditFormOpen = true;
    this.selectedSection = { ...section };
    
    // Set trial unit and command for edit form
    if (section.trial_unit) {
      this.selectedSection.trial_unit = section.trial_unit;
      this.selectedTrialUnitId = section.trial_unit.id;
    }
    if (section.command) {
      this.selectedSection.command = section.command;
    }
  }

  deleteSectionDetails(section: Section): void {
    this.showDeleteDialog = true;
    this.selectedSection = section;
  }

  confirmDeletion() {
    const payload = { id: this.selectedSection.id, delete: true };
    this.apiService.post('master/section/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Section deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete section');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Section name is required');
      return;
    }

    if (!data.trial_unit) {
      this.toastService.showError('Trial Unit is required');
      return;
    }

    if (!data.command) {
      this.toastService.showError('Command is required');
      return;
    }

    const payload = {
      id: this.selectedSection.id,
      trial_unit: parseInt(data.trial_unit),
      command: parseInt(data.command),
      name: data.name,
      description: data.description || '',
      code: data.code || '',
      sequence: parseInt(data.sequence) || 1,
      status: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/section/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Section successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update section');
      },
    });
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
    { field: 'name', header: 'Section Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'description', header: 'Description', filterType: 'text' },
    { field: 'trial_unit.name', header: 'Trial Unit', filterType: 'text' },
    { field: 'command.name', header: 'Command', filterType: 'text' },
    { field: 'sequence', header: 'Sequence', filterType: 'text' },
    { field: 'status', header: 'Status', filterType: 'text' },
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

  exportPDF() {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.sections.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'status') {
            return row[col.field] === 1 ? 'Active' : 'Inactive';
          }
          if (col.field === 'trial_unit.name') {
            return row['trial_unit']?.name || 'N/A';
          }
          if (col.field === 'command.name') {
            return row['command']?.name || 'N/A';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'section'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.sections.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.field === 'status') {
          return row[col.field] === 1 ? 'Active' : 'Inactive';
        }
        if (col.field === 'trial_unit.name') {
          return row['trial_unit']?.name || 'N/A';
        }
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
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'section'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    this.sections = data || [];
    this.filteredSections = [...(data || [])];
    this.cdr.detectChanges();
  }
}
