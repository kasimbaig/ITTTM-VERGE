import { CommonModule, NgClass } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-view-details',
  imports: [CommonModule, DialogModule],
  templateUrl: './view-details.component.html',
  styleUrl: './view-details.component.css',
})
export class ViewDetailsComponent implements OnInit {
  @Input() open = false;
  @Output() onOpenChange = new EventEmitter<boolean>();
  activeTab = 'info';
  @Input() headers: any[] = [];
  @Input() title: string = '';
  @Input() viewDetails: any[] = [];
  view() {
    //console.log('dtails', this.viewDetails);
  }
  ngOnInit(): void {}

  // toggleOpen(open: boolean) {
  //   this.open = open;
  // }
  closeDialog() {
    this.onOpenChange.emit(false);
  }
  isMaximized: boolean = false;

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
  }

  demoItem = {
    id: 'ITEM-1234',
    title: 'Product Name',
    description:
      'This is a detailed description of the product that provides comprehensive information about features, benefits, and specifications.',
    status: 'Active',
    category: 'Electronics',
    dateCreated: '2025-03-15',
    lastUpdated: '2025-04-10',
    tags: ['Featured', 'Sale', 'New Arrival'],
    stats: {
      views: 1240,
      purchases: 85,
      rating: 4.8,
    },
  };
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
