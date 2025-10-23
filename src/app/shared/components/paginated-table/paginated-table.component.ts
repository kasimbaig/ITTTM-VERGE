import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
  OnInit,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { Table } from 'primeng/table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Menu } from 'primeng/menu';
import { InputSwitchModule } from 'primeng/inputswitch';
import { FormsModule } from '@angular/forms';


import { ButtonModule } from 'primeng/button';
import { NestedValuePipe } from '../../../../nested-value.pipe';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-paginated-table',
  standalone: true,
  imports: [
    FormsModule,
    TableModule,
    PaginatorModule,
    CommonModule,
    NestedValuePipe,
    Menu,
    ButtonModule,
    InputSwitchModule,
    LoadingSpinnerComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './paginated-table.component.html',
  styleUrl: './paginated-table.component.css',
  
})
export class PaginatedTableComponent implements OnInit,OnChanges {

  @Input() columns: any[] = [];
  @Input() extraHeaderColumns: any[] = [];
  @Input() extraColumns: any[] = [];
  @Input() data: any[] = [];
  @Input() tableName: string = '';
  @Input() showStartActions: boolean = true;
  @Input() customHeaderNameStart: string = '';
  @Input() showEndActions: boolean = true;
  @Input() customHeaderNameEnd: string = '';
  @Input() showViewAction: boolean = true; // default is true
  @Input() showEditAction: boolean = true; // default is true
  @Input() showDeleteAction: boolean = true; // default is true
  @Input() dropdown: boolean = false;
  @Input() showAcquiredFrom: boolean = false;
  @Input() selectionEnabled: boolean = false;
  @Input() selectedRows: any[] = [];
  @Output() selectedRowsChange = new EventEmitter<any[]>();
  @Input() isLoading: boolean = false;
  @Input() isShearchDisable: string = 'T';
  @Input() apiUrl: string = '';
  @Input() totalCount: number = 0;
  @Input() rowsPerPage: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50, 100];
  @Input() showFirstLastIcon: boolean = true;
  @Input() showPageLinks: boolean = true;
  @Input() showCurrentPageReport: boolean = true;
  @Input() showJumpToPageDropdown: boolean = false;

  searchValue: string = '';
  globalFilterFields: string[] = [];
 
  @Output() pageChange = new EventEmitter<{ page: number; rows: number }>();
  @Output() exportCSVEvent = new EventEmitter<void>();
  @Output() exportPDFEvent = new EventEmitter<void>();
  @Output() viewEvent = new EventEmitter<any>();
  @Output() editEvent = new EventEmitter<any>();
  @Output() deleteEvent = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() acquiredFromEvent = new EventEmitter<any>();
  @Output() dataLoaded = new EventEmitter<any[]>();
  rowClicked(row: any) {
    this.rowClick.emit(row);
  }
  @ContentChild('actions') actionsTemplate!: TemplateRef<any>;
  // Optional full override for empty state content
  @ContentChild('emptyState') emptyStateTemplate?: TemplateRef<any>;
  currentPage: number = 1;
  // filterData:any[]=[];
constructor(private apiService: ApiService){}

  /**
   * Helper method to extract data and count from different API response structures
   * @param response - The API response object
   * @returns Object containing extracted data array and count
   */
  private extractDataFromResponse(response: any): { data: any[], count: number } {
    console.log('🔍 PAGINATED TABLE - extractDataFromResponse called with:', response);
    
    let extractedData: any[] = [];
    let extractedCount: number = 0;

    // Check if response is a direct array (Response Type 1: [{...}, {...}])
    if (Array.isArray(response)) {
      console.log('🔍 PAGINATED TABLE - Response Type 1: Direct array');
      extractedData = [...response];
      extractedCount = response.length;
    }
    // Check for nested results structure (Response Type 2: {count: 1, results: {data: [...]}})
    else if (response.results && response.results.data) {
      console.log('🔍 PAGINATED TABLE - Response Type 2: Nested results.data');
      extractedData = [...response.results.data];
      extractedCount = response.count || response.results.data.length;
    }
    // Check for standard paginated response with results array (Response Type 3: {count: 1, results: [...]})
    else if (response.results && Array.isArray(response.results)) {
      console.log('🔍 PAGINATED TABLE - Response Type 3: Standard results array');
      extractedData = [...response.results];
      extractedCount = response.count || response.results.length;
    }
    // Check for standard paginated response (Response Type 4: {data: [...], count: 10})
    else if (response.data) {
      console.log('🔍 PAGINATED TABLE - Response Type 4: Standard data array');
      extractedData = [...response.data];
      extractedCount = response.count || response.data.length;
    }
    // Fallback for any other structure
    else {
      console.log('🔍 PAGINATED TABLE - Response Type 5: Fallback (no data found)');
      extractedData = [];
      extractedCount = 0;
    }

    console.log('🔍 PAGINATED TABLE - Final extracted data:', extractedData);
    console.log('🔍 PAGINATED TABLE - Final extracted count:', extractedCount);
    
    return { data: extractedData, count: extractedCount };
  }

  ngOnInit(): void {
    // this.cdr.detectChanges();
    if(this.data.length === 0 && this.apiUrl){
      // this.isLoading=true;
      this.onPageChange({first:0,rows:this.rowsPerPage})
    } else {
      // If data is already provided, emit it
      this.dataLoaded.emit(this.data);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes['data'] || changes['apiUrl']){
      this.onPageChange({first:0,rows:this.rowsPerPage})
    }
  }



  onPageChange(event: any): void {
    const rows=event.rows;
    const first=event.first;
    const page=first/rows+1;
    // Handle existing query parameters in the API URL
    const separator = this.apiUrl.includes('?') ? '&' : '?';
    let apiUrl = `${this.apiUrl}${separator}page=${page}`;
    
    console.log('🔍 PAGINATED TABLE - Loading data from API URL:', apiUrl);
    
    this.apiService.get<any>(apiUrl).subscribe((response: any) => {
      console.log('🔍 PAGINATED TABLE - API Response received:', response);
      
      this.isLoading=false;

      // Extract data and count using helper method
      const { data: extractedData, count: extractedCount } = this.extractDataFromResponse(response);
      
      console.log('🔍 PAGINATED TABLE - Extracted data:', extractedData);
      console.log('🔍 PAGINATED TABLE - Extracted count:', extractedCount);

      this.data = extractedData;
      this.totalCount = extractedCount;
      
      console.log('🔍 PAGINATED TABLE - this.data set to:', this.data);
      console.log('🔍 PAGINATED TABLE - this.totalCount set to:', this.totalCount);
    
      // Emit the loaded data to parent component
      this.dataLoaded.emit(extractedData);
      console.log('🔍 PAGINATED TABLE - Emitted dataLoaded event with:', extractedData);
    });
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
    table.filterGlobal('', 'contains');
  }
  exportCSV() {
    this.exportCSVEvent.emit(); // Emit event instead of direct call
    const headers = this.columns.map((col) => col.header);
    const rows = this.data.map((row) =>
      this.columns.map((col) => row[col.field] || '')
    );
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.tableName || 'table'}.csv`; // ✅ Use backticks
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private actionItemsCache = new Map<any, any[]>();

  getActionItems(rowData: any): any[] {
    if (this.actionItemsCache.has(rowData)) {
      return this.actionItemsCache.get(rowData)!;
    }

    const actions = [];

    if (this.showViewAction) {
      actions.push({
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => this.viewEvent.emit(rowData),
      });
    }

    actions.push(
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.editEvent.emit(rowData),
        visible: this.showEditAction
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteEvent.emit(rowData),
        visible: this.showDeleteAction
      }
    );

    if (this.showAcquiredFrom) {
      actions.push({
        label: 'Acquired From',
        icon: 'pi pi-briefcase',
        command: () => this.acquiredFromEvent.emit(rowData),
      });
    }

    // Filter out actions that are not visible
    const visibleActions = actions.filter(action => action.visible !== false);
    
    this.actionItemsCache.set(rowData, visibleActions);
    return visibleActions;
  }



  onStatusChange(row: any) {
    // Additional logic can be added here
  }


  exportPDF() {
    this.exportPDFEvent.emit(); // Emit event instead of direct call
    const doc = new jsPDF();
    autoTable(doc, {
      head: [this.columns.map((col) => col.header)],
      body: this.data.map((row) =>
        this.columns.map((col) => row[col.field] || '')
      ),
    });
    doc.save(`${this.tableName || 'table'}.pdf`); // ✅ Use backticks
  }
  activeRow: any = null;
  items = [
    // {
    //     // label: 'Options',
    //     items: [
    {
      label: 'View',
      icon: 'pi pi-refresh',
    },
    {
      label: 'Edit',
      icon: 'pi pi-refresh',
    },
    {
      label: 'Delete',
      icon: 'pi pi-upload',
    },
    //     ]
    // }
  ];
  menuOpen: boolean = false;
  toggleMenu(e: Event, rowData: any) {
    this.activeRow = this.activeRow === rowData ? null : rowData;
    this.menuOpen = this.menuOpen === rowData ? null : rowData;
  }

  view(row: any) {
    this.viewEvent.emit(row); // Emit to SFD component
    this.activeRow = null;
  }

  edit(row: any) {
    this.editEvent.emit(row); // Emit to SFD component
    this.activeRow = null;
  }

  delete(row: any) {
    this.deleteEvent.emit(row); // Emit to SFD component
    this.activeRow = null;
  }
  isMenuOpen = false;

  // toggleMenu() {
  //   this.isMenuOpen = !this.isMenuOpen;
  // }

  closeMenu() {
    this.isMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.menu-container')) {
      this.closeMenu();
    }
  }

  onSearchInput(value: string): string {
    return value.toLowerCase();
  }
}
