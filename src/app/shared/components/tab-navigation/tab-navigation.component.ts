import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabConfig {
  id: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-navigation.component.html',
  styleUrl: './tab-navigation.component.css'
})
export class TabNavigationComponent {
  @Input() tabs: TabConfig[] = [
    { id: 'draft', label: 'Draft', count: 0 },
    { id: 'work-in-progress', label: 'Work-in-Progress', count: 0 },
    { id: 'approved', label: 'Approved', count: 0 }
  ];
  
  @Input() activeTab: string = 'draft';
  @Output() tabChange = new EventEmitter<string>();

  onTabClick(tabId: string): void {
    if (tabId !== this.activeTab) {
      this.activeTab = tabId;
      this.tabChange.emit(tabId);
    }
  }
}
