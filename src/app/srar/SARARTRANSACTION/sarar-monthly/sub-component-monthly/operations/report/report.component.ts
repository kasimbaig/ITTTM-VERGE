import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { NgxPrintModule } from 'ngx-print';
import { FormsModule } from '@angular/forms';
import { boilerRunningHoursAndInspectionDetailsHeader } from '../../../../../srar-report/srarReportHeader';

@Component({
  selector: 'app-report',
  standalone:true,
  imports:[CommonModule,NgxPrintModule,FormsModule  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent implements OnInit, OnChanges{

  @Input() reportData: any;
  @Input() tableData: any[] = [ {
    "monthYear": "1/2025",
    "ship_name": "INS SUVARNA",
    "command_name": "Western Naval Command",
    "equipment_name": "AC CHILLED WATER PUMP (TSBC 4/40)",
    "equipment_code": "04401036",
    "location_name": "Engine Room",
    "hours_underway": 122.0,
    "equipment_running_hours": 122.0
}];
  @Input() headerRows: any[][]=boilerRunningHoursAndInspectionDetailsHeader;
  @Input() reportSubHeading: string = 'SRAR Monthly Report';
  // Default nested array key (can be overridden)
  @Input() defaultNestedArrayKey: string = 'shipDetails';
  dataColumns: any[] = [];
  visibleDataColumns: any[] = [];
  renderHeaderRows: any[][] = [];
  showCustomizer = false;
  columnSelectionMap: { [selectionId: string]: boolean } = {};
  private nestedArrayCache: WeakMap<any, any[]> = new WeakMap();
  date:string=new Date().toLocaleDateString()
  time:string=new Date().toLocaleTimeString()

  constructor(private cdr: ChangeDetectorRef) {}

  /**
   * Helper method to get nested property value using dot notation
   * @param obj The object to search in
   * @param path The dot-separated path (e.g., 'user.profile.name')
   * @returns The value or empty string if not found
   */
  private getNestedValue(obj: any, path: string): any {
    if (!obj || !path) return '';
    
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }
  ngOnInit(): void {
    // Ensure initial computation for both single-layer and multi-layer headers
    this.dataColumns = this.computeDataColumns(this.headerRows);
    if (!this.dataColumns || this.dataColumns.length === 0) {
      this.dataColumns = [];
    }
    // Initialize column selection if empty
    if (Object.keys(this.columnSelectionMap).length === 0) {
      this.dataColumns.forEach(col => {
        if (col.selectionId) this.columnSelectionMap[col.selectionId] = true;
      });
    }
    this.updateVisibleStructures();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['headerRows']) {
      this.dataColumns = this.computeDataColumns(this.headerRows);
      // Initialize selection map for new headers if not already set or keys changed
      const existingKeys = new Set(Object.keys(this.columnSelectionMap));
      const newKeys = new Set(this.dataColumns.map(c => String(c.selectionId)));
      // If keys differ or empty, reset to all selected
      if (existingKeys.size === 0 || existingKeys.size !== newKeys.size ||
          [...newKeys].some(k => !existingKeys.has(k))) {
        this.columnSelectionMap = {};
        this.dataColumns.forEach(col => {
          if (col.selectionId) this.columnSelectionMap[col.selectionId] = true;
        });
      }
      // Update visible structures whenever headers change
      this.updateVisibleStructures();
    }
    if (changes['tableData']) {
      this.nestedArrayCache = new WeakMap();
    }
    this.cdr.markForCheck();
  }
  
  /**
   * Helper method to get data value based on header configuration
   * @param item The main data item
   * @param nestedItem The nested array item (if applicable)
   * @param header The header column configuration
   * @returns The formatted data value
   */
  getDataValue(item: any, nestedItem: any, header: any): any {
    if (!header.key) return '';
    
    let value: any = '';
    
    if (header.source === 'main') {
      value = this.getNestedValue(item, header.key);
    } else if (header.source === 'nested') {
      value = this.getNestedValue(nestedItem, header.key);
    }
    
    // Apply formatter if provided
    if (header.formatter && typeof header.formatter === 'function') {
      return header.formatter(value);
    }
    
    return value !== null && value !== undefined ? value : '';
  }

  /**
   * Get the nested array from an item
   * @param item The main data item
   * @param header The header column configuration (uses nestedArrayKey or default)
   * @returns The nested array or array with single empty object for rendering
   */
  getNestedArray(item: any, header?: any): any[] {
    // Return from cache if available
    const cached = this.nestedArrayCache.get(item);
    if (cached) return cached;

    const arrayKey = header?.nestedArrayKey || this.defaultNestedArrayKey;
    const nestedArray = item ? item[arrayKey] : undefined;
    
    // If no nested array exists, return array with single empty object
    // This ensures at least one row is rendered for main data
    if (!nestedArray || !Array.isArray(nestedArray) || nestedArray.length === 0) {
      const single = [{}];
      this.nestedArrayCache.set(item, single);
      return single; // Single empty object to render one row
    }

    this.nestedArrayCache.set(item, nestedArray);
    return nestedArray;
  }

  getNestedArrayLength(item: any): number {
    return this.getNestedArray(item).length;
  }

  /**
   * Get the data columns (columns that have keys)
   * Automatically finds the last header row that contains data columns
   * @returns Array of HeaderColumn with keys
   */
  private computeDataColumns(headerRows: any[][]): any[] {
    if (!headerRows || headerRows.length === 0) return [];

    const numHeaderRows = headerRows.length;
    const cellTracker: boolean[][] = [];
    let maxCols = 0;

    // First pass: compute max columns with occupancy tracking
    for (let rowIdx = 0; rowIdx < numHeaderRows; rowIdx++) {
      cellTracker[rowIdx] = cellTracker[rowIdx] || [];
      let colIdx = 0;
      const row = headerRows[rowIdx] || [];
      for (const cell of row) {
        // Skip already occupied cells
        while (cellTracker[rowIdx][colIdx]) {
          colIdx++;
        }

        const colspan = parseInt(String(cell?.colspan || 1), 10) || 1;
        const rowspan = parseInt(String(cell?.rowspan || 1), 10) || 1;

        // Mark cells as occupied for subsequent rows
        for (let r = 0; r < rowspan; r++) {
          const rIdx = rowIdx + r;
          cellTracker[rIdx] = cellTracker[rIdx] || [];
          for (let c = 0; c < colspan; c++) {
            cellTracker[rIdx][colIdx + c] = true;
          }
        }

        colIdx += colspan;
      }
      maxCols = Math.max(maxCols, colIdx);
    }

    // Second pass: build column stacks per visual column
    const colStacks: any[][] = new Array(maxCols).fill(null).map(() => []);
    // Reset tracker for placement
    const placeTracker: boolean[][] = [];
    for (let rowIdx = 0; rowIdx < numHeaderRows; rowIdx++) {
      placeTracker[rowIdx] = placeTracker[rowIdx] || [];
      let colIdx = 0;
      const row = headerRows[rowIdx] || [];
      for (const cell of row) {
        while (placeTracker[rowIdx][colIdx]) {
          colIdx++;
        }
        const colspan = parseInt(String(cell?.colspan || 1), 10) || 1;
        const rowspan = parseInt(String(cell?.rowspan || 1), 10) || 1;
        for (let c = 0; c < colspan; c++) {
          const absoluteCol = colIdx + c;
          if (!colStacks[absoluteCol]) colStacks[absoluteCol] = [];
          colStacks[absoluteCol].push(cell);
        }
        // Mark cells as occupied similarly
        for (let r = 0; r < rowspan; r++) {
          const rIdx = rowIdx + r;
          placeTracker[rIdx] = placeTracker[rIdx] || [];
          for (let c = 0; c < colspan; c++) {
            placeTracker[rIdx][colIdx + c] = true;
          }
        }
        colIdx += colspan;
      }
    }

    // Build final leaf columns, preferring the deepest cell with a key
    const leafColumns: any[] = [];
    for (let col = 0; col < maxCols; col++) {
      const stack = colStacks[col] || [];
      // Find last header in the stack that has a key
      for (let i = stack.length - 1; i >= 0; i--) {
        const cell = stack[i];
        if (cell && cell.key) {
          const selectionId = `${i}-${col}-${cell.key}`;
          leafColumns.push({ ...cell, selectionId });
          break;
        }
      }
    }

    return leafColumns;
  }

  // Compute which header rows and data columns are visible based on current selection
  private updateVisibleStructures(): void {
    const visibleSelectionIds = new Set<string>(
      this.dataColumns
        .map(c => c.selectionId as string)
        .filter((id: string) => !!id && this.columnSelectionMap[id] !== false)
    );

    // Ensure at least one column is visible; if none, default to all
    if (visibleSelectionIds.size === 0) {
      this.dataColumns.forEach(col => {
        if (col.selectionId) this.columnSelectionMap[col.selectionId] = true;
      });
      this.visibleDataColumns = [...this.dataColumns];
      this.renderHeaderRows = JSON.parse(JSON.stringify(this.headerRows || []));
      return;
    }

    // Visible data columns are filtered by selected keys
    this.visibleDataColumns = this.dataColumns.filter(col => col.selectionId && visibleSelectionIds.has(col.selectionId));

    // Recompute header rows with adjusted colspans/rowspans
    this.renderHeaderRows = this.computeVisibleHeaderRows(this.headerRows || [], visibleSelectionIds);
  }

  private computeVisibleHeaderRows(headerRows: any[][], visibleSelectionIds: Set<string>): any[][] {
    const numHeaderRows = headerRows.length;
    if (numHeaderRows === 0) return [];

    // First pass: determine maxCols with occupancy tracking (same as computeDataColumns)
    const cellTracker: boolean[][] = [];
    let maxCols = 0;
    for (let rowIdx = 0; rowIdx < numHeaderRows; rowIdx++) {
      cellTracker[rowIdx] = cellTracker[rowIdx] || [];
      let colIdx = 0;
      const row = headerRows[rowIdx] || [];
      for (const cell of row) {
        while (cellTracker[rowIdx][colIdx]) colIdx++;
        const colspan = parseInt(String(cell?.colspan || 1), 10) || 1;
        const rowspan = parseInt(String(cell?.rowspan || 1), 10) || 1;
        for (let r = 0; r < rowspan; r++) {
          const rIdx = rowIdx + r;
          cellTracker[rIdx] = cellTracker[rIdx] || [];
          for (let c = 0; c < colspan; c++) {
            cellTracker[rIdx][colIdx + c] = true;
          }
        }
        colIdx += colspan;
      }
      maxCols = Math.max(maxCols, colIdx);
    }

    // Build column stacks to identify leaf keys per visual column
    const colStacks: any[][] = new Array(maxCols).fill(null).map(() => []);
    const placeTracker: boolean[][] = [];
    for (let rowIdx = 0; rowIdx < numHeaderRows; rowIdx++) {
      placeTracker[rowIdx] = placeTracker[rowIdx] || [];
      let colIdx = 0;
      const row = headerRows[rowIdx] || [];
      for (const cell of row) {
        while (placeTracker[rowIdx][colIdx]) colIdx++;
        const colspan = parseInt(String(cell?.colspan || 1), 10) || 1;
        const rowspan = parseInt(String(cell?.rowspan || 1), 10) || 1;
        for (let c = 0; c < colspan; c++) {
          const absoluteCol = colIdx + c;
          if (!colStacks[absoluteCol]) colStacks[absoluteCol] = [];
          colStacks[absoluteCol].push(cell);
        }
        for (let r = 0; r < rowspan; r++) {
          const rIdx = rowIdx + r;
          placeTracker[rIdx] = placeTracker[rIdx] || [];
          for (let c = 0; c < colspan; c++) {
            placeTracker[rIdx][colIdx + c] = true;
          }
        }
        colIdx += colspan;
      }
    }

    const colIsVisible: boolean[] = new Array(maxCols).fill(false);
    for (let col = 0; col < maxCols; col++) {
      const stack = colStacks[col] || [];
      let leafSelectionId: string | undefined;
      for (let i = stack.length - 1; i >= 0; i--) {
        const cell = stack[i];
        if (cell && cell.key) { 
          // selection id is derived the same way as in computeDataColumns
          leafSelectionId = `${i}-${col}-${cell.key}`;
          break; 
        }
      }
      colIsVisible[col] = leafSelectionId ? visibleSelectionIds.has(leafSelectionId) : false;
    }

    // Third pass: rebuild header rows with adjusted colspans and filtered cells
    const rebuilt: any[][] = [];
    const rebuildTracker: boolean[][] = [];
    for (let rowIdx = 0; rowIdx < numHeaderRows; rowIdx++) {
      rebuildTracker[rowIdx] = rebuildTracker[rowIdx] || [];
      let colIdx = 0;
      const row = headerRows[rowIdx] || [];
      const newRow: any[] = [];
      for (const cell of row) {
        while (rebuildTracker[rowIdx][colIdx]) colIdx++;
        const colspan = parseInt(String(cell?.colspan || 1), 10) || 1;
        const rowspan = parseInt(String(cell?.rowspan || 1), 10) || 1;

        // Count visible columns in this span
        let visibleCount = 0;
        for (let c = 0; c < colspan; c++) {
          if (colIsVisible[colIdx + c]) visibleCount++;
        }

        // If the cell has a key (leaf) and is not visible, skip
        if (cell?.key) {
          if (visibleCount === 0) {
            // mark occupied as in original to keep placement consistent
            for (let r = 0; r < rowspan; r++) {
              const rIdx = rowIdx + r;
              rebuildTracker[rIdx] = rebuildTracker[rIdx] || [];
              for (let c = 0; c < colspan; c++) rebuildTracker[rIdx][colIdx + c] = true;
            }
            colIdx += colspan;
            continue;
          }
          // leaf is visible -> visibleCount should be 1
        } else {
          // Group cell without key: if no visible leaf underneath, skip
          if (visibleCount === 0) {
            for (let r = 0; r < rowspan; r++) {
              const rIdx = rowIdx + r;
              rebuildTracker[rIdx] = rebuildTracker[rIdx] || [];
              for (let c = 0; c < colspan; c++) rebuildTracker[rIdx][colIdx + c] = true;
            }
            colIdx += colspan;
            continue;
          }
        }

        // Create adjusted cell
        const adjusted: any = { ...cell };
        if (visibleCount > 0) {
          if (visibleCount === 1) {
            delete adjusted.colspan;
          } else {
            adjusted.colspan = visibleCount;
          }
        }
        // Rowspan stays as-is
        newRow.push(adjusted);

        // Mark occupied
        for (let r = 0; r < rowspan; r++) {
          const rIdx = rowIdx + r;
          rebuildTracker[rIdx] = rebuildTracker[rIdx] || [];
          for (let c = 0; c < colspan; c++) rebuildTracker[rIdx][colIdx + c] = true;
        }
        colIdx += colspan;
      }
      rebuilt.push(newRow);
    }
    return rebuilt;
  }

  // Customizer UI handlers
  openCustomizer(): void {
    this.showCustomizer = true;
  }

  closeCustomizer(): void {
    this.showCustomizer = false;
  }

  selectAllColumns(): void {
    this.dataColumns.forEach(col => { if (col.selectionId) this.columnSelectionMap[col.selectionId] = true; });
    this.updateVisibleStructures();
  }

  clearAllColumns(): void {
    this.dataColumns.forEach(col => { if (col.selectionId) this.columnSelectionMap[col.selectionId] = false; });
    this.updateVisibleStructures();
  }

  toggleColumn(selectionId: string, checked: boolean): void {
    this.columnSelectionMap[selectionId] = checked;
    this.updateVisibleStructures();
  }

  /**
   * Get CSS classes for a cell based on header configuration
   * @param header The header column configuration
   * @param colIndex Column index
   * @returns CSS class string
   */
  getCellClasses(header: any, colIndex: number): string {
    let classes = 'border border-gray-400 p-2 text-center';
    
    // Add custom cell class if provided
    if (header.cellClass) {
      classes += ' ' + header.cellClass;
    }
    
    // Add default styling based on column properties
    if (colIndex === 0) classes += ' font-medium';
    if (header.key === 'eqptCode' || header.key?.includes('Code')) classes += ' font-mono';
    if (header.key?.includes('Name') || header.key?.includes('name')) classes += ' font-semibold';
    
    return classes;
  }

  // trackBy helpers
  trackByIndex(index: number): number { return index; }
  trackByHeader(index: number, col: any): any { return col?.selectionId || col?.label || col?.key || index; }



  downloadWord() {
    // Get the HTML content from the print section
    const element = document.getElementById('printsection');
    if (!element) {
      console.error('Print section not found');
      return;
    }

    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Remove print buttons and other no-print elements
    const noPrintElements = clonedElement.querySelectorAll('.no-print, .print-buttons');
    noPrintElements.forEach(el => el.remove());

    // Get the HTML content
    let htmlContent = clonedElement.innerHTML;
    
    // Add basic styling for Word document
    const styledContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; background-color: #f3f4f6; font-size: 12px; }
            .tborder { border: 1px solid #000; padding: 8px; text-align: center; }
            .text-3xl { font-size: 24px; font-weight: bold; color: #b91c1c; margin-bottom: 10px; }
            .text-2xl { font-size: 20px; font-weight: 600; color: #1e3a8a; margin-bottom: 15px; }
            .text-lg { font-size: 16px; font-weight: 500; color: #374151; }
            .bg-gray-100 { background-color: #f3f4f6; padding: 10px; border: 1px solid #d1d5db; margin: 10px 0; }
            .grid { display: table; width: 100%; }
            .grid-cols-2 { display: table-row; }
            .grid-cols-6 { display: table-row; }
            .md\:grid-cols-6 { display: table-row; }
            .flex { display: inline-block; margin: 5px 10px; }
            .font-semibold { font-weight: 600; }
            .text-blue-700 { color: #1d4ed8; }
            .text-gray-800 { color: #1f2937; }
            .bg-blue-600 -900 { background-color: #1e3a8a !important; color: white !important; }
            .bg-blue-600 -700 { background-color: #1d4ed8 !important; color: white !important; }
            .bg-blue-600 -500 { background-color: #3b82f6 !important; color: white !important; }
            .text-white { color: white !important; }
            .font-bold { font-weight: bold; }
            .text-center { text-align: center; }
            .mb-2 { margin-bottom: 10px; }
            .mb-4 { margin-bottom: 15px; }
            .mb-6 { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([styledContent], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const reportTitle = this.reportSubHeading || 'Report';
    link.download = `${reportTitle.replace(/\s+/g, '_')}_${currentDate}.doc`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    //console.log('Word document downloaded successfully');
  }

  downloadExcel() {
    //console.log('Downloading Excel with structure...');
  
    try {
      const printSection = document.getElementById('printsection');
      if (!printSection) {
        console.error('Print section not found');
        alert('Unable to find the report section for export.');
        return;
      }
  
      const worksheetData: any[][] = [];
      const merges: XLSX.Range[] = [];
      let currentRow = 0;
  
      // Add title and subtitle
      const title = printSection.querySelector('.text-3xl')?.textContent?.trim() || '';
      const subtitle = printSection.querySelector('.text-2xl')?.textContent?.trim() || '';
      const dateTime = printSection.querySelector('.text-lg')?.textContent?.trim() || '';
      
      if (title) {
        worksheetData.push([title]);
        // Merge title across multiple columns (assuming max 10 columns)
        merges.push({
          s: { r: currentRow, c: 0 },
          e: { r: currentRow, c: 9 }
        });
        currentRow++;
      }
      
      if (subtitle) {
        worksheetData.push([subtitle]);
        merges.push({
          s: { r: currentRow, c: 0 },
          e: { r: currentRow, c: 9 }
        });
        currentRow++;
      }
      
      if (dateTime) {
        worksheetData.push([dateTime]);
        merges.push({
          s: { r: currentRow, c: 0 },
          e: { r: currentRow, c: 9 }
        });
        currentRow++;
      }
      
      // Add empty row
      worksheetData.push([]);
      currentRow++;
  
      // Process report parameters table
      const paramTable = printSection.querySelector('table');
      if (paramTable && paramTable.querySelector('tr.bg-gray-100')) {
        const paramRow = paramTable.querySelector('tr.bg-gray-100');
        const paramCells = paramRow?.querySelectorAll('td');
        
        if (paramCells) {
          const paramRowData: string[] = [];
          paramCells.forEach(cell => {
            const text = cell.textContent?.trim() || '';
            paramRowData.push(text);
          });
          worksheetData.push(paramRowData);
          currentRow++;
        }
        
        // Add empty row after parameters
        worksheetData.push([]);
        currentRow++;
      }
  
      // Process main data table with complex header structure
      const mainTable = printSection.querySelector('table.table-auto');
      if (mainTable) {
        const headerRowElements = mainTable.querySelectorAll('thead tr');
        const numHeaderRows = headerRowElements.length;
        
        // First, determine the actual number of columns by looking at all rows
        let maxCols = 0;
        const cellTracker: boolean[][] = [];
        
        // Initialize cell tracker for header rows
        for (let i = 0; i < numHeaderRows; i++) {
          cellTracker[i] = [];
        }
        
        // Process headers to determine actual column count and track occupied cells
        headerRowElements.forEach((tr, rowIdx) => {
          let colIdx = 0;
          
          tr.querySelectorAll('th').forEach(th => {
            // Skip already occupied cells
            while (cellTracker[rowIdx][colIdx]) {
              colIdx++;
            }
            
            const colspan = parseInt(th.getAttribute('colspan') || '1');
            const rowspan = parseInt(th.getAttribute('rowspan') || '1');
            
            // Mark cells as occupied
            for (let r = 0; r < rowspan; r++) {
              for (let c = 0; c < colspan; c++) {
                if (!cellTracker[rowIdx + r]) {
                  cellTracker[rowIdx + r] = [];
                }
                cellTracker[rowIdx + r][colIdx + c] = true;
              }
            }
            
            colIdx += colspan;
          });
          
          maxCols = Math.max(maxCols, colIdx);
        });
        
        // Create header grid with proper dimensions
        const headerGrid: (string | null)[][] = [];
        for (let i = 0; i < numHeaderRows; i++) {
          headerGrid[i] = new Array(maxCols).fill(null);
        }
        
        // Fill header grid with actual values and track merges
        headerRowElements.forEach((tr, rowIdx) => {
          let colIdx = 0;
          
          tr.querySelectorAll('th').forEach(th => {
            // Find next available cell in this row
            while (colIdx < maxCols && headerGrid[rowIdx][colIdx] !== null) {
              colIdx++;
            }
            
            const text = th.textContent?.trim() || '';
            const colspan = parseInt(th.getAttribute('colspan') || '1');
            const rowspan = parseInt(th.getAttribute('rowspan') || '1');
            
            // Place text in the grid
            headerGrid[rowIdx][colIdx] = text;
            
            // Fill spanned cells with empty strings to maintain structure
            for (let r = 0; r < rowspan; r++) {
              for (let c = 0; c < colspan; c++) {
                if (r > 0 || c > 0) {
                  if (rowIdx + r < numHeaderRows) {
                    headerGrid[rowIdx + r][colIdx + c] = '';
                  }
                }
              }
            }
            
            // Add merge information if cell spans multiple rows/columns
            if (colspan > 1 || rowspan > 1) {
              merges.push({
                s: { r: currentRow + rowIdx, c: colIdx },
                e: { r: currentRow + rowIdx + rowspan - 1, c: colIdx + colspan - 1 }
              });
            }
            
            colIdx += colspan;
          });
        });
        
        // Add header rows to worksheet, converting null to empty string
        headerGrid.forEach(row => {
          const cleanRow = row.map(cell => cell === null ? '' : cell);
          worksheetData.push(cleanRow);
        });
        currentRow += numHeaderRows;
        
        // Process body rows with rowspan tracking
        const bodyRows = mainTable.querySelectorAll('tbody tr');
        const rowspanTracker: Map<number, { value: string; remainingRows: number }> = new Map();
        
        bodyRows.forEach((tr, trIdx) => {
          const rowData: string[] = new Array(maxCols).fill('');
          let colIdx = 0;
          
          // First, handle any active rowspans from previous rows
          rowspanTracker.forEach((span, col) => {
            if (span.remainingRows > 0) {
              rowData[col] = '';  // Cell is part of a rowspan
              span.remainingRows--;
              if (span.remainingRows === 0) {
                rowspanTracker.delete(col);
              }
            }
          });
          
          tr.querySelectorAll('td').forEach(td => {
            // Skip columns that are occupied by rowspans
            while (colIdx < maxCols && (rowData[colIdx] !== '' || rowspanTracker.has(colIdx))) {
              colIdx++;
            }
            
            if (colIdx >= maxCols) return;
            
            const text = td.textContent?.trim() || '';
            const colspan = parseInt(td.getAttribute('colspan') || '1');
            const rowspan = parseInt(td.getAttribute('rowspan') || '1');
            
            rowData[colIdx] = text;
            
            // Handle rowspan
            if (rowspan > 1) {
              rowspanTracker.set(colIdx, { value: text, remainingRows: rowspan - 1 });
              
              // Add merge for rowspan
              merges.push({
                s: { r: currentRow, c: colIdx },
                e: { r: currentRow + rowspan - 1, c: colIdx + colspan - 1 }
              });
            }
            
            // Handle colspan
            if (colspan > 1) {
              for (let c = 1; c < colspan; c++) {
                if (colIdx + c < maxCols) {
                  rowData[colIdx + c] = '';
                  if (rowspan > 1) {
                    rowspanTracker.set(colIdx + c, { value: '', remainingRows: rowspan - 1 });
                  }
                }
              }
              
              // Add merge for colspan (if no rowspan already added)
              if (rowspan === 1 && colspan > 1) {
                merges.push({
                  s: { r: currentRow, c: colIdx },
                  e: { r: currentRow, c: colIdx + colspan - 1 }
                });
              }
            }
            
            colIdx += colspan;
          });
          
          worksheetData.push(rowData);
          currentRow++;
        });
      }
  
      // Create workbook
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Apply merges
      if (merges.length > 0) {
        ws['!merges'] = merges;
      }
  
      // Set column widths
      const colWidths: number[] = [];
      worksheetData.forEach(row => {
        row.forEach((cell, idx) => {
          const cellValue = cell ? cell.toString() : '';
          const len = cellValue.length;
          colWidths[idx] = Math.max(colWidths[idx] || 12, Math.min(len + 2, 50));
        });
      });
      
      ws['!cols'] = colWidths.map(wch => ({ wch }));
  
      // Apply some basic styling
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;
          
          // Add basic cell styling
          ws[cellAddress].s = {
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            }
          };
          
          // Style header rows
          if (R >= 6 && R < 6 + (mainTable?.querySelectorAll('thead tr').length || 0)) {
            ws[cellAddress].s.fill = {
              fgColor: { rgb: '1E3A8A' }
            };
            ws[cellAddress].s.font = {
              color: { rgb: 'FFFFFF' },
              bold: true
            };
          }
        }
      }
  
      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SRAR Report');
  
      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const fileName = `${this.reportSubHeading?.replace(/\s+/g, '_') || 'Report'}_${date}.xlsx`;
  
      // Download file
      XLSX.writeFile(wb, fileName);
  
      //console.log('Excel downloaded successfully with proper header structure.');
    } catch (err) {
      console.error('Excel download failed:', err);
      alert('Error generating Excel file. Please try again.');
    }
  }
  
  getobject(obj:any){
    return obj.name || obj || 'N/A';
  }
}
