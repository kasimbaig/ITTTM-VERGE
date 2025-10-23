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

interface Command {
  id: number;
  name: string;
  code: string;
  active: number;
  created_on: string;
  created_ip: string;
  modified_on: string;
  modified_ip: string | null;
  created_by: number;
  modified_by: number | null;
}

interface Station {
  id: number;
  name: string;
  code: string;
  command_name?: string;
  command?: number;
  active: number; // 1 = Active, 2 = Inactive
  created_on: string;
  created_ip?: string;
  modified_on?: string;
  modified_ip?: string | null;
  created_by?: number;
  modified_by?: number | null;
}

@Component({
  selector: 'app-station',
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
  templateUrl: './station.component.html',
  styleUrl: './station.component.css'
})
export class StationComponent implements OnInit {
  searchText: string = '';
  stations: Station[] = [];
  commands: Command[] = [];
  selectedCommandId: number | null = null;
  isLoadingCommands: boolean = false;
  deptdisplayModal: boolean = false;
  viewdisplayModal: boolean = false;
  editdisplayModal: boolean = false;
  showDeleteDialog: boolean = false;
  isFormOpen: boolean = false;
  isEditFormOpen: boolean = false;
  editTitle: string = 'Edit Station Master';
  title: string = 'Add New Station Master';
  
  newStation = {
    name: '',
    code: '',
    command: null,
    active: 1,
  };
  
  selectedStation: Station = {
    id: 0,
    name: '',
    code: '',
    active: 1,
    command: undefined,
    created_on: ''
  };

  formConfigForNewDetails: any[] = [
    {
      label: 'Command',
      key: 'command',
      type: 'select',
      required: true,
      options: [],
      onChange: (value: any) => this.handleCommandChange(value)
    },
    {
      label: 'Station Name',
      key: 'name',
      type: 'text',
      required: true,
    },
    {
      label: 'Station Code',
      key: 'code',
      type: 'text',
      required: false,
    },
    {
      label: 'Status',
      key: 'status',
      type: 'checkbox',
      required: false,
    }
  ];

  filteredStations: Station[] = [];
  toggleTable: boolean = true;

  // New properties for pagination
  apiUrl: string = 'master/stations/';
  totalCount: number = 0;

  constructor(
    private apiService: ApiService,
    private toastService: ToastService, 
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCommands();
    // Note: Table data will be loaded by the paginated table component
  }

  goBack() {
    this.location.back();
  }

  getStations(): void {
    this.apiService.get<any>('master/stations/').subscribe({
      next: (response) => {
        let stationsData = [];
        if (response && response.results) {
          stationsData = response.results;
        } else {
          stationsData = response;
        }
        
        // Map command names to stations
        this.stations = stationsData.map((station: Station) => {
          const command = this.commands.find(cmd => cmd.id === station.command);
          return {
            ...station,
            command_name: command ? command.name : 'Unknown Command'
          };
        });
        
        this.filteredStations = [...this.stations];
      },
      error: (error) => {
        console.error('Error fetching stations:', error);
      },
    });
  }

  fetchCommands(): void {
    this.isLoadingCommands = true;
    this.apiService.get<any>('master/command/').subscribe({
      next: (response) => {
        // Handle different response formats
        let commandsData = [];
        if (response && response.data) {
          // Response format: {status: 200, data: [...]}
          commandsData = response.data;
        } else if (response && response.results) {
          // Response format: {count: 5, results: [...]}
          commandsData = response.results;
        } else if (Array.isArray(response)) {
          // Direct array response
          commandsData = response;
        }
        
        this.commands = commandsData;
        
        // Update form config with command options for dropdown
        this.formConfigForNewDetails[0].options = this.commands.map(command => ({
          value: command.id,
          label: command.name || 'Unknown Command'
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

  handleCommandChange(commandId: number): void {
    this.selectedCommandId = commandId;
  }

  // Search function
  filterStations() {
    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      this.stations = [...this.filteredStations];
      return;
    }

    this.stations = this.filteredStations.filter(
      (station: Station) =>
        station.name.toLowerCase().includes(search) ||
        (station.code && station.code.toLowerCase().includes(search)) ||
        (station.command_name && station.command_name.toLowerCase().includes(search))
    );
  }

  openAddStation() {
    this.deptdisplayModal = true;
  }

  closeDialog() {
    this.deptdisplayModal = false;
    this.viewdisplayModal = false;
    this.showDeleteDialog = false;
    this.editdisplayModal = false;
    this.isFormOpen = false;
    this.isEditFormOpen = false;
    this.selectedStation = {
      id: 0,
      name: '',
      code: '',
      active: 1,
      command: undefined,
      created_on: ''
    };
    this.selectedCommandId = null;
  }

  handleSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Station name is required');
      return;
    }

    if (!data.command) {
      this.toastService.showError('Command is required');
      return;
    }

    const payload = {
      name: data.name,
      code: data.code,
      command: parseInt(data.command),
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/stations/', payload).subscribe({
      next: (res: any) => {
        this.toastService.showSuccess(res.message || 'Station added successfully');
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

  viewStationDetails(station: Station) {
    this.viewdisplayModal = true;
    this.selectedStation = station;
  }

  editStationDetails(station: Station) {
    this.isEditFormOpen = true;
    this.selectedStation = { ...station };
    
    // Set command for edit form
    if (station.command) {
      this.selectedStation.command = station.command;
      this.selectedCommandId = station.command;
    }
  }

  deleteStationDetails(station: Station): void {
    this.showDeleteDialog = true;
    this.selectedStation = station;
  }

  confirmDeletion() {
    const payload = { id: this.selectedStation.id, delete: true };
    this.apiService.post('master/stations/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Station deleted successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.showDeleteDialog = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to delete station');
      },
    });
  }

  cancelDeletion() {
    this.showDeleteDialog = false;
  }

  handleEditSubmit(data: any) {
    // Validation
    if (!data.name?.trim()) {
      this.toastService.showError('Station name is required');
      return;
    }

    if (!data.command) {
      this.toastService.showError('Command is required');
      return;
    }

    const payload = {
      id: this.selectedStation.id,
      name: data.name,
      code: data.code,
      command: parseInt(data.command),
      active: data.status === 'Active' ? 1 : 2,
    };

    this.apiService.post('master/stations/', payload).subscribe({
      next: (data: any) => {
        this.toastService.showSuccess('Updated Station successfully');
        this.toggleTable = false;
        setTimeout(() => {
          this.toggleTable = true;
        }, 100);
        this.closeDialog();
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastService.showError('Failed to update station');
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
    { field: 'name', header: 'Station Name', filterType: 'text' },
    { field: 'code', header: 'Code', filterType: 'text' },
    { field: 'command_name', header: 'Command', filterType: 'text' },
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

  exportPDF() {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.cols.map((col) => col.header)],
      body: this.stations.map((row: { [x: string]: any }) =>
        this.cols.map((col) => {
          if (col.field === 'active') {
            return row[col.field] === 1 ? 'Active' : 'Inactive';
          }
          return row[col.field] || '';
        })
      ),
    });
    doc.save(`${this.tableName || 'station'}.pdf`);
  }

  @Input() tableName: string = '';

  exportExcel() {
    this.exportCSVEvent.emit();
    const headers = this.cols.map((col) => col.header);
    const rows = this.stations.map((row: { [x: string]: any }) =>
      this.cols.map((col) => {
        if (col.field === 'active') {
          return row[col.field] === 1 ? 'Active' : 'Inactive';
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
    link.download = `${this.tableName || 'station'}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Handle data loaded from paginated table
  onDataLoaded(data: any[]): void {
    // Map command names to stations
    this.stations = (data || []).map((station: Station) => {
      const command = this.commands.find(cmd => cmd.id === station.command);
      return {
        ...station,
        command_name: command ? command.name : 'Unknown Command'
      };
    });
    this.filteredStations = [...this.stations];
    this.cdr.detectChanges();
  }
}
