import { Injectable, EventEmitter } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportCSVEvent = new EventEmitter<void>();
  exportPDFEvent = new EventEmitter<void>();

  exportExcel(cols: any[], data: any[], tableName: string = 'table') {
    this.exportCSVEvent.emit();
    const headers = cols.map((col) => col.header);
    const rows = data.map((row) => cols.map((col) => row[col.field] || ''));
    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tableName}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportPDF(cols: any[], data: any[], tableName: string = 'table') {
    this.exportPDFEvent.emit();
    const doc = new jsPDF();
    autoTable(doc, {
      head: [cols.map((col) => col.header)],
      body: data.map((row) => cols.map((col) => row[col.field] || '')),
    });
    doc.save(`${tableName}.pdf`);
  }
}
