import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-sarar-status',
  standalone: false,
  templateUrl: './sarar-status.component.html',
  styleUrl: './sarar-status.component.css'
})
export class SararStatusComponent implements OnInit {

  shipOptions: any[] = [];
  unitOptions: any[] = [];
  commandOptions: any[] = [];
  activeFilter: string = 'IN';
  tableColumns: any[] = [];
  tableData: any[] = [];
  isAdvanceSearch: boolean = false;
  selectedMonth: string = '';
  selectedYear: string = '';
  isLoading: boolean = false;
  
  // Command mapping for tabs - will be populated with actual IDs from API
  commandMapping: { [key: string]: number } = {};
  
  // Table headers for different tabs
  inHeader = [
    { field: 'command', header: 'Command', type: 'text', sortable: true, filterable: true },
    { field: 'ops_authority', header: 'Ops Authority', type: 'text', sortable: true, filterable: true },
    { field: 'ship', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'missing_months', header: 'Month Not Render', type: 'text', sortable: true, filterable: true }
  ];

  wncHeader = [
    { field: 'command', header: 'Command', type: 'text', sortable: true, filterable: true },
    { field: 'ops_authority', header: 'Ops Authority', type: 'text', sortable: true, filterable: true },
    { field: 'ship', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'missing_months', header: 'Month Not Render', type: 'text', sortable: true, filterable: true }
  ];

  encHeader = [
    { field: 'command', header: 'Command', type: 'text', sortable: true, filterable: true },
    { field: 'ops_authority', header: 'Ops Authority', type: 'text', sortable: true, filterable: true },
    { field: 'ship', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'missing_months', header: 'Month Not Render', type: 'text', sortable: true, filterable: true }
  ];

  sncHeader = [
    { field: 'command', header: 'Command', type: 'text', sortable: true, filterable: true },
    { field: 'ops_authority', header: 'Ops Authority', type: 'text', sortable: true, filterable: true },
    { field: 'ship', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'missing_months', header: 'Month Not Render', type: 'text', sortable: true, filterable: true }
  ];

  ancHeader = [
    { field: 'command', header: 'Command', type: 'text', sortable: true, filterable: true },
    { field: 'ops_authority', header: 'Ops Authority', type: 'text', sortable: true, filterable: true },
    { field: 'ship', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'missing_months', header: 'Month Not Render', type: 'text', sortable: true, filterable: true }
  ];

  // Updated table headers for all tabs to show the same columns
  tableHeaders = [
    { field: 'command', header: 'Command', type: 'text', sortable: true, filterable: true },
    { field: 'ops_authority', header: 'Ops Authority', type: 'text', sortable: true, filterable: true },
    { field: 'ship', header: 'Ship Name', type: 'text', sortable: true, filterable: true },
    { field: 'missing_months', header: 'Months Not Rendered', type: 'text', sortable: true, filterable: true }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.tableColumns = this.inHeader;
    this.loadCommandOptions();
    // Load missing SRAR data for IN tab by default
    this.loadMissingSrarData('IN');
  }

  loadCommandOptions(): void {
    // Load command options and map them to tab abbreviations
    this.apiService.get('master/command/?is_dropdown=true').subscribe({
      next: (response: any) => {
        this.commandOptions = response.results || response || [];
        this.mapCommandsToTabs();
      },
      error: (error) => {
        console.error('Error fetching command data:', error);
        this.commandOptions = [];
      }
    });
  }

  mapCommandsToTabs(): void {
    // Map command names to tab abbreviations and store their IDs
    this.commandOptions.forEach(command => {
      const commandName = command.name?.toLowerCase() || '';
      
      if (commandName.includes('western naval command') || commandName.includes('wnc')) {
        this.commandMapping['WNC'] = command.id;
      } else if (commandName.includes('eastern naval command') || commandName.includes('enc')) {
        this.commandMapping['ENC'] = command.id;
      } else if (commandName.includes('southern naval command') || commandName.includes('snc')) {
        this.commandMapping['SNC'] = command.id;
      } else if (commandName.includes('andaman') || commandName.includes('nicobar') || commandName.includes('anc')) {
        this.commandMapping['ANC'] = command.id;
      } else if (commandName.includes('indian navy') || commandName.includes('in')) {
        this.commandMapping['IN'] = command.id;
      }
    });
    
    //console.log('Command mapping:', this.commandMapping);
  }

  get commandOptionsForDropdown(): any[] {
    return [
      {label: 'Select Command', value: ''},
      ...this.commandOptions.map(cmd => ({label: cmd.name, value: cmd.id}))
    ];
  }

  loadMissingSrarData(commandType?: string): void {
    this.isLoading = true;
    let params: any = {};
    
    if (this.isAdvanceSearch) {
      if (this.selectedMonth) {
        params.month = this.selectedMonth;
      }
      if (this.selectedYear) {
        params.year = this.selectedYear;
      }
    }
    
    // Add command filter based on active tab using command_id
    if (commandType && this.commandMapping[commandType]) {
      params.command_id = this.commandMapping[commandType];
    }

    this.apiService.get(`srar/missing-srar-monthly-headers/`, params).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.tableData = response.data.missing_ships || [];
        } else {
          this.tableData = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching missing SRAR data:', error);
        this.tableData = [];
        this.isLoading = false;
      }
    });
  }

  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
    if (filter === 'IN') {
      this.tableColumns = this.inHeader;
      // Call missing SRAR API for IN tab with Indian Navy filter
      this.loadMissingSrarData('IN');
    } else if (filter === 'WNC') {
      this.tableColumns = this.wncHeader;
      this.loadMissingSrarData('WNC');
    } else if (filter === 'ENC') {
      this.tableColumns = this.encHeader;
      // Load data for ENC tab with Eastern Naval Command filter
      this.loadMissingSrarData('ENC');
    } else if (filter === 'SNC') {
      this.tableColumns = this.sncHeader;
      // Load data for SNC tab with Southern Naval Command filter
      this.loadMissingSrarData('SNC');
    } else if (filter === 'ANC') {
      this.tableColumns = this.ancHeader;
      // Load data for ANC tab with Andaman & Nicobar Command filter
      this.loadMissingSrarData('ANC');
    }
  }

  onSearch(): void {
    // Search based on active tab and advanced search filters
    this.loadMissingSrarData(this.activeFilter);
  }

  onMonthChange(): void {
    // Don't trigger API call automatically - only when search button is clicked
  }

  onYearChange(): void {
    // Don't trigger API call automatically - only when search button is clicked
  }
}