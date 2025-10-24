import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from '../../../services/api.service';
// Corrected the import path
@Component({
  selector: 'app-elastic-search',
  standalone: true, // Added standalone property
  imports: [CommonModule,FormsModule],
  templateUrl: './elastic-search.component.html',
  styleUrls: ['./elastic-search.component.css']
})
export class ElasticSearchComponent {
  search:string=''
  results: any[] = [];
  displayResults: Array<{
    id?: string | number;
    title: string;
    index?: string;
    score?: number;
    type?: string;
    previewFields: Array<{ key: string; value: unknown; isPrimitive: boolean }>;
    allFields: Array<{ key: string; value: unknown; isPrimitive: boolean }>;
    expanded: boolean;
    raw: any;
  }> = [];
  private searchSubject = new Subject<string>();
  loading = false;
  currentQuery = '';
  appSummary: any = null;
  private readonly titleCandidates = [
    'name', 'title', 'label', 'equipment_name', 'ship_name', 'section_name',
    'manufacturer_name', 'apply_to_name', 'parent_equipment_name', 'remarks',
    'nomenclature', 'description'
  ];
  private readonly fieldPriorityOrder = [
    'equipment_name', 'ship_name', 'equipment_code', 'parent_equipment_name', 'parent_equipment_code',
    'oem_part_number', 'manufacturer_name', 'supplier_name', 'department_name', 'department_code',
    'location_name', 'location_code', 'nomenclature', 'remarks',
    'installation_date', 'removal_date', 'service_life', 'no_of_fits', 'authority_of_removal', 'authority_of_installation',
    'section_name', 'sfd_reference_name', 'apply_to_name', 'sfd_reference_code', 'apply_to_code'
  ];

  constructor(private apiService:ApiService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.loading = true;
        return this.apiService.get1('master/global-search/?q='+query);
      })
    ).subscribe({
      next: (data) => {
        const payload: any = data?.data ?? data ?? {};
        let results: any[] = [];
        const direct = payload?.hits?.hits ?? payload?.hits ?? payload?.results;
        if (Array.isArray(direct)) {
          results = direct;
        }
        if ((!results || results.length === 0) && payload?.grouped_results && typeof payload.grouped_results === 'object') {
          results = Object.values(payload.grouped_results).flat() as any[];
        }
        this.appSummary = payload?.app_summary ?? null;

        this.results = results || [];
        this.displayResults = (results || []).map((item) => this.buildDisplayItem(item));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(query: string) {
    this.currentQuery = query;
    this.searchSubject.next(query);
  }

  private buildDisplayItem(item: any) {
    const source = item?._source ?? item ?? {};
    const allFields = this.extractFields(source);
    const previewFields = allFields.slice(0, 6);

    const title = this.pickTitle(source) ?? String(item?._id ?? '') ?? 'Untitled';
    const index = item?._index;
    const score = item?._score;
    const type = item?._type;

    return {
      id: item?._id ?? source?.id,
      title: title || 'Untitled',
      index,
      score,
      type,
      previewFields,
      allFields,
      expanded: false,
      raw: item
    };
  }

  private extractFields(obj: any): Array<{ key: string; value: unknown; isPrimitive: boolean }> {
    if (!obj || typeof obj !== 'object') return [];
    const entries = Object.entries(obj) as Array<[string, unknown]>;
    const sorted = entries.sort((a, b) => {
      const ia = this.fieldPriorityOrder.indexOf(a[0]);
      const ib = this.fieldPriorityOrder.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return sorted.map(([key, value]) => {
      const isPrimitive = value === null || ['string', 'number', 'boolean'].includes(typeof value);
      return {
        key,
        value: isPrimitive ? value : JSON.stringify(value, null, 2),
        isPrimitive
      };
    });
  }

  private pickTitle(source: any): string | undefined {
    if (!source) return undefined;
    for (const key of this.titleCandidates) {
      const val = source[key];
      if (typeof val === 'string' && val.trim().length) return val;
    }
    if (source?.id != null) return String(source.id);
    return undefined;
  }

  resetSearch(input?: HTMLInputElement) {
    if (input) {
      input.value = '';
    }
    this.currentQuery = '';
    this.results = [];
    this.displayResults = [];
    this.appSummary = null;
    this.loading = false;
  }
  searchInput(value:string){
    let query=value.toLowerCase().trim()
    return query
  }
}

