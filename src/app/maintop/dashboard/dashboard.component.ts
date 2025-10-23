import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DashChart1Component } from '../dash-chart1/dash-chart1.component';
import { Dash2ChartComponent } from '../dash2-chart/dash2-chart.component';
import { DashJicTableComponent } from '../dash-jic-table/dash-jic-table.component';
import { Dash3ChartComponent } from '../dash3-chart/dash3-chart.component';
import { StatCardComponent } from '../stat-card/stat-card.component';
import { Dash4ChartComponent } from '../dash4-chart/dash4-chart.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Card } from '../../interfaces/interfaces';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { resetFilterCards } from '../../shared/utils/filter-helper';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';

import { RoleService } from '../../services/role-service/role.service';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
interface JIC {
  jicid: number;
  maintopID: number;
  routineID: number;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: string;
  sparesCount: number;
  toolsCount: number;
}
type StatusKey = 'Pending' | 'In Progress' | 'Completed';
@Component({
  selector: 'app-dashboard',
  imports: [
    CardModule,
    DialogModule,
    Dash3ChartComponent,
    StatCardComponent,
    Dash4ChartComponent,
    CommonModule,
    PaginatedTableComponent,
    DropdownModule,
    FormsModule
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  
})
export class DashboardComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService
  ) {}
  chartData: any = [];
  maintopDetails: any[] = [];
  filteredMaintopHeaders: any[] = [];
  filteredFrequencies: any[] = [];
  userRole: string = 'Super Admin';
  ships: any;

  frequencyData = [
    {
      name: 'Jan',
      daily: 4,
      weekly: 12,
      monthly: 25,
      quarterly: 8,
      yearly: 3,
    },
    {
      name: 'Feb',
      daily: 3,
      weekly: 10,
      monthly: 22,
      quarterly: 7,
      yearly: 3,
    },
    {
      name: 'Mar',
      daily: 5,
      weekly: 14,
      monthly: 28,
      quarterly: 9,
      yearly: 4,
    },
    {
      name: 'Apr',
      daily: 6,
      weekly: 16,
      monthly: 30,
      quarterly: 10,
      yearly: 5,
    },
    {
      name: 'May',
      daily: 4,
      weekly: 12,
      monthly: 24,
      quarterly: 8,
      yearly: 3,
    },
    {
      name: 'Jun',
      daily: 3,
      weekly: 9,
      monthly: 18,
      quarterly: 6,
      yearly: 2,
    },
  ];

  async ngOnInit(): Promise<void> {
    try {
      this.roleService.role$.subscribe((role) => {
        //console.log(role);
        this.userRole = role;
        this.currentView = this.userRole === 'Super Admin' ? 'admin' : 'ship';
      });

      // Wait for both ships and maintopHeaders concurrently
      const [ships, maintopHeaders] = await Promise.all([
        this.apiService.get<any[]>('master/ship/').toPromise(),
        this.apiService.get<any[]>('maintop/maintop-header').toPromise(),
      ]);

      // Process ships data
      this.ships = ships;
      const shipCard = this.shipCard.find((card) => card.label === 'Ships');
      if (shipCard) {
        shipCard.options = this.ships.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
        //console.log('Ship options:', shipCard.options);
      }

      // Check if maintopHeaders exist
      if (!maintopHeaders) {
        console.error('No maintop headers data received');
        return;
      }

      // Process Maintop Headers once
      this.filteredMaintopHeaders = this.mapMaintopHeaders(maintopHeaders);
      //console.log(this.filteredMaintopHeaders);

      const departmentCountMap: { [key: string]: number } = {};
      const departmentGroupedItems: { [key: string]: any[] } = {};

      maintopHeaders.forEach((item) => {
        const deptName = item.equipment?.group?.section?.department?.name;
        if (deptName) {
          departmentCountMap[deptName] =
            (departmentCountMap[deptName] || 0) + 1;
          if (!departmentGroupedItems[deptName]) {
            departmentGroupedItems[deptName] = [];
          }
          departmentGroupedItems[deptName].push(item);
        }
      });

      // Convert count map to chart data
      this.chartData = Object.entries(departmentCountMap).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
      this.cdr.detectChanges();

      // Log chart and group data
      //console.log('Chart Data:', this.chartData);
      //console.log('Grouped Items by Department:', departmentGroupedItems);

      // Set dropdown options
      this.setMaintopHeaderOptions(maintopHeaders);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  // Helper function to map Maintop Headers to a format usable in the component
  private mapMaintopHeaders(maintopHeaders: any[]): any[] {
    return (
      maintopHeaders?.map((dept: any) => ({
        label: dept.code,
        value: dept.id,
      })) || []
    );
  }

  // Helper function to set the Maintop Header card options
  private setMaintopHeaderOptions(maintopHeaders: any[]): void {
    const headerCard = this.cards.find(
      (card) => card.label === 'Maintop Header'
    );
    if (headerCard) {
      headerCard.options = this.mapMaintopHeaders(maintopHeaders);
      //console.log('Maintop Header card options:', headerCard.options);
    }
  }

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Maintop Header':
        this.onMaintopChange(value);
        break;
    }
  }

  onMaintopChange(headerId: any) {
    //console.log(this.chartData);
    this.apiService
      .get<any[]>(`maintop/maintop-detail/?maintop_header=${headerId}`)
      .subscribe((headers) => {
        const maintopHeaderMap = this.filteredMaintopHeaders.reduce(
          (acc: any, header: any) => {
            acc[header.value] = header.label;
            return acc;
          },
          {}
        );

        const frequencyMap = this.filteredFrequencies.reduce(
          (acc: any, freq: any) => {
            acc[freq.value] = freq.label;
            return acc;
          },
          {}
        );

        this.maintopDetails = headers.map((item: any) => ({
          ...item,
          maintopHeaderTitle:
            maintopHeaderMap[item.maintop_header] || 'Unknown',
          frequencyName: frequencyMap[item.frequency] || 'Unknown',
        }));
      });
  }
  cards: Card[] = [
    {
      label: 'Maintop Header',
      selectedOption: null,
      options: [],
    },
  ];
  jics: JIC[] = [
    {
      jicid: 1001,
      maintopID: 501,
      routineID: 201,
      description: 'Main Engine Overhaul',
      status: 'Completed' as const,
      date: '2025-04-15',
      sparesCount: 12,
      toolsCount: 8,
    },
    {
      jicid: 1002,
      maintopID: 502,
      routineID: 202,
      description: 'Pump Maintenance',
      status: 'In Progress' as const,
      date: '2025-04-20',
      sparesCount: 5,
      toolsCount: 4,
    },
    {
      jicid: 1003,
      maintopID: 503,
      routineID: 203,
      description: 'Generator Inspection',
      status: 'Pending' as const,
      date: '2025-04-25',
      sparesCount: 0,
      toolsCount: 3,
    },
    {
      jicid: 1004,
      maintopID: 504,
      routineID: 204,
      description: 'Propeller Shaft Alignment',
      status: 'Completed' as const,
      date: '2025-04-10',
      sparesCount: 2,
      toolsCount: 6,
    },
    {
      jicid: 1005,
      maintopID: 505,
      routineID: 205,
      description: 'Air Conditioning Repair',
      status: 'In Progress' as const,
      date: '2025-04-18',
      sparesCount: 7,
      toolsCount: 5,
    },
  ];
  chartData2 = [
    { name: 'Pending', value: 25, color: '#ffcc00' },
    { name: 'In Progress', value: 50, color: '#00bfff' },
    { name: 'Completed', value: 25, color: '#32cd32' },
  ];
  cols = [
    { field: 'no', header: 'Number' },
    { field: 'group_heading', header: 'Group Heading' },
    { field: 'admin_remark', header: 'Remark' },
    { field: 'by_whom', header: 'BY WHOM' },
    { field: 'dock_yard_remark', header: 'Dock yard Remark' },
  ];
  chartData4 = [
    {
      name: 'Engineering',
      pending: 5,
      inProgress: 12,
      completed: 30,
    },
    {
      name: 'Deck',
      pending: 3,
      inProgress: 8,
      completed: 22,
    },
    {
      name: 'Navigation',
      pending: 2,
      inProgress: 6,
      completed: 15,
    },
    {
      name: 'Electrical',
      pending: 2,
      inProgress: 6,
      completed: 11,
    },
  ];
  getCardColor(index: number): string {
    const colors = ['#6366F1', '#14B8A6', '#F59E0B', '#EF4444']; // Indigo, Teal, Amber, Red
    return colors[index % colors.length];
  }

  adminStats = [
    {
      title: 'Active Maintenance Tasks',
      value: 1247,
      change: '+85 since last week',
    },
    {
      title: 'Pending JICs',
      value: 156,
      change: '-23 since yesterday',
    },
    {
      title: 'Assigned Crew',
      value: 324,
      change: '+12 since last month',
    },
  ];
  shipCard: Card[] = [
    {
      label: 'Ships',
      selectedOption: null,
      options: [],
    },
  ];

  shipUserStats = [
    {
      title: 'My Tasks',
      value: 24,
      change: '8 due today',
    },
    {
      title: 'Ship Maintenance Tasks',
      value: 152,
      change: '32 pending approval',
    },
    {
      title: 'Spare Parts Inventory',
      value: 487,
      change: '12 below threshold',
    },
    {
      title: 'Tools Available',
      value: 96,
      change: '4 checked out',
    },
  ];

  currentView: 'admin' | 'ship' = 'admin';
  get isAdmin() {
    return this.currentView === 'admin';
  }

  get stats() {
    return this.isAdmin ? this.adminStats : this.shipUserStats;
  }

  // maintenanceStatusData = maintenanceStatusData;
  // departmentTasksData = departmentTasksData;
  // frequencyData = frequencyData;
  // departmentDistributionData = departmentDistributionData;
  // jicTableData = jicTableData;
  currentYear = new Date().getFullYear();

  setCurrentView(view: 'admin' | 'ship') {
    this.currentView = view;
  }

  getStatIcon(index: number): string {
    const isAdmin = this.isAdmin;
    if (index === 0) return isAdmin ? 'fa fa-ship' : 'fa fa-calendar-alt';
    if (index === 1) return 'fa fa-wrench';
    if (index === 2) return isAdmin ? 'fa fa-calendar-alt' : 'fa fa-box';
    return isAdmin ? 'fa fa-users' : 'fa fa-tools';
  }

  resetFilters() {
    resetFilterCards(this.cards, 'Maintop Header', this.maintopDetails);
  }
  selectedStatus = '';
  statusDetails: { name: string }[] = [];
  displayPopup = false;
  
  
  allDetails: Record<StatusKey, { name: string }[]> = {
    Pending: [
      { name: 'Inspect Hydraulic Pump' },
      { name: 'Replace Air Filter' },
      { name: 'Check Oil Levels' },
      { name: 'Test Alarm System' },
      { name: 'Clean Cooling Fans' },
      { name: 'Lubricate Conveyor Belt' },
      { name: 'Calibrate Pressure Sensor' },
      { name: 'Check Fuel Valves' },
      { name: 'Replace Battery Cells' },
      { name: 'Inspect Electrical Wiring' }
    ],
    'In Progress': [
      { name: 'Repair Fuel Pump' },
      { name: 'Test Backup Generator' },
      { name: 'Replace Gearbox Oil' },
      { name: 'Align Motor Shafts' },
      { name: 'Upgrade Control Panel' },
      { name: 'Inspect Fire Suppression System' },
      { name: 'Service Cooling Tower' },
      { name: 'Diagnose Hydraulic Leak' },
      { name: 'Install New Sensors' },
      { name: 'Clean Heat Exchanger' }
    ],
    Completed: [
      { name: 'Replaced Turbocharger' },
      { name: 'Fixed Air Compressor' },
      { name: 'Repaired Valve Assembly' },
      { name: 'Conducted Vibration Analysis' },
      { name: 'Upgraded Software Firmware' },
      { name: 'Replaced Engine Mounts' },
      { name: 'Tested Emergency Lighting' },
      { name: 'Repaired Fuel Injector' },
      { name: 'Performed Safety Inspection' },
      { name: 'Completed Structural Welding' }
    ]
  };
  
  
  onSegmentClicked(status: string) {
    if (status === 'Pending' || status === 'In Progress' || status === 'Completed') {
      this.selectedStatus = status;
      this.statusDetails = this.allDetails[status];
      this.displayPopup = true;
    } else {
      console.warn('Invalid status:', status);
    }
  }
  
  

}
