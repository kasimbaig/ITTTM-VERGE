import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

export interface TabOption {
  key: string;
  label: string;
  icon: string;
  count?: number;
}

@Component({
  selector: 'app-status-tabs',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './status-tabs.component.html',
  styleUrls: ['./status-tabs.component.css']
})
export class StatusTabsComponent implements OnInit {
  @Input() activeTab: string = 'draft';
  @Input() showCounts: boolean = true;
  @Input() customTabs: TabOption[] = [];
  @Output() tabChange = new EventEmitter<string>();

  defaultTabs: TabOption[] = [
    { key: 'draft', label: 'Draft', icon: 'pi pi-file-edit', count: 0 },
    { key: 'work-in-progress', label: 'Work in Progress', icon: 'pi pi-clock', count: 0 },
    { key: 'approved', label: 'Approved', icon: 'pi pi-check-circle', count: 0 }
  ];

  tabs: TabOption[] = [];

  ngOnInit(): void {
    this.tabs = this.customTabs.length > 0 ? this.customTabs : this.defaultTabs;
  }

  onTabClick(tabKey: string): void {
    this.activeTab = tabKey;
    this.tabChange.emit(tabKey);
  }

  updateTabCount(tabKey: string, count: number): void {
    const tab = this.tabs.find(t => t.key === tabKey);
    if (tab) {
      tab.count = count;
    }
  }
}
