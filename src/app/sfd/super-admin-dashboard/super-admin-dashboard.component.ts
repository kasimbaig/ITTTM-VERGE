import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Card } from '../../interfaces/interfaces';
import { resetFilterCards } from '../../shared/utils/filter-helper';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaginatedTableComponent } from '../../shared/components/paginated-table/paginated-table.component';
@Component({
  selector: 'app-super-admin-dashboard',
  imports: [PaginatedTableComponent, DropdownModule, FormsModule, CommonModule,RouterModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.scss',
})
export class SuperAdminDashboardComponent implements OnInit, OnDestroy {
  ships: any[] = [];
  @Input() data: any[] = [];
  equipmentDistribution: { [sectionName: string]: number } = {};
  equipmentChartData: { name: string; count: number; color: string }[] = [];
  latestEquipmentInstalled: any;
  equipments: any;
  activeEquipmentCount: number = 0;
  activeShipCount: number = 0;
  sections: any[] = [];
  selecedShipId: any;
  equipmentCount: any;
  equipmentDetails: any[] = [];
  sectionCount: number = 0;
  groupCount: any;
  recentFittingCount: any;

  cards: Card[] = [
    {
      label: 'Command',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Ship',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Section',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Group',
      selectedOption: null,
      options: [],
    },
    {
      label: 'Equipment',
      selectedOption: null,
      options: [],
    },
  ];

  shipCard: Card[] = [
    {
      label: 'Ships',
      selectedOption: null,
      options: [],
    },
  ];

  applyFilter(card: any, value: any) {
    //console.log(card, value);
    switch (card) {
      case 'Ships':
        this.onMasterShipChange(value);
        break;
      case 'Command':
        this.onCommandChange(value);
        break;
      case 'Ship':
        this.onShipChange(value);
        break;

      case 'Section':
        this.onSectionChange(value);
        break;
      case 'Group':
        this.onGroupChange(value);
        break;
      case 'Equipment':
        this.onEquipmentChange(value);
        break;
    }
  }
  onMasterShipChange(shipId: number) {
    this.selecedShipId = shipId;
    this.apiService
      .get<any[]>(`sfd/equipment-ship-details/?ship=${this.selecedShipId}`)
      .subscribe((headers) => {
        //console.log(headers);
        this.equipmentCount = headers.length;
        this.activeEquipmentCount = headers.filter(
          (item) => item.active === 1
        ).length;

        const distinctSectionNames = new Set();
        headers.forEach((entry) => {
          if (entry.group?.section?.name) {
            distinctSectionNames.add(entry.group.section.name);
          }
        });
        this.sectionCount = distinctSectionNames.size;
        const distinctGroupNames = new Set();
        headers.forEach((entry) => {
          if (entry.group?.name) {
            distinctGroupNames.add(entry.group.name);
          }
        });
        this.groupCount = distinctGroupNames.size;

        const today = new Date();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(today.getDate() - 2);
        const recentfittings = headers.filter((item) => {
          if (!item.installation_date) return false;

          const installDate = new Date(item.installation_date);
          return installDate >= twoDaysAgo && installDate <= today;
        });
        this.recentFittingCount = recentfittings.length;
        this.calculateEquipmentDistribution(headers);
      });
  }
  onCommandChange(commandId: number) {
    //console.log(commandId);
    this.apiService
      .get<any[]>(`master/ship/?command=${commandId}&dropdown=${true}`)
      .subscribe((headers) => {
        const shipcommandCard = this.cards.find(
          (card) => card.label === 'Ship'
        );
        if (shipcommandCard) {
          shipcommandCard.options = headers.map((header) => ({
            label: header.name,
            value: header.id,
          }));
          //console.log(shipcommandCard.options);
        }
      });
  }

  onShipChange(shipId: number) {
    this.selecedShipId = shipId;
    this.apiService
      .get<any[]>(`master/section/?dropdown=${true}`)
      .subscribe((headers) => {
        const sectioncommandCard = this.cards.find(
          (card) => card.label === 'Section'
        );
        if (sectioncommandCard) {
          sectioncommandCard.options = headers.map((header: any) => ({
            label: header.name,
            value: header.id,
          }));
          //console.log(sectioncommandCard.options);
        }
      });
  }
  onSectionChange(groupId: number) {
    this.apiService
      .get<any[]>(`master/group/?dropdown=${true}`)
      .subscribe((headers) => {
        //console.log(headers);

        const groupcommandCard = this.cards.find(
          (card) => card.label === 'Group'
        );
        if (groupcommandCard) {
          groupcommandCard.options = headers.map((header) => ({
            label: header.name,
            value: header.id,
          }));
          //console.log(groupcommandCard.options);
        }
      });
  }
  onGroupChange(equipmentId: number) {
    //console.log(equipmentId);
    this.apiService
      .get<any[]>(`master/equipment/?dropdown=${true}`)
      .subscribe((headers) => {
        //console.log(headers);

        const equipmentcommandCard = this.cards.find(
          (card) => card.label === 'Equipment'
        );
        if (equipmentcommandCard) {
          equipmentcommandCard.options = headers.map((header) => ({
            label: header.name,
            value: header.id,
          }));
        }
      });
  }

  resetFilters() {
    resetFilterCards(this.cards, 'Command', this.equipmentDetails);
  }

  onEquipmentChange(equipmentId: any) {
    this.apiService
      .get<any[]>(
        `sfd/equipment-ship-details/?equipment=${equipmentId}&ship=${this.selecedShipId}`
      )
      .subscribe((headers) => {
        //console.log(headers);
        this.equipmentDetails = headers;
        this.equipmentDetails = headers.map((header: any) => ({
          ...header,
          active: header.active === 1 ? 'Active' : 'Inactive',
        }));
      });
  }

  shipcols = [
    { field: 'sr_no', header: 'Ship No' },
    { field: 'name', header: 'Name' },
    { field: 'ship_category.name', header: 'Category' },
    { field: 'class_master.name', header: 'Class' },
    { field: 'active', header: 'Status' },
  ];
  eqcols = [
    { field: 'ship.name', header: 'Ship' },
    { field: 'equipment.name', header: 'Equipment Name' },
    { field: 'location_code', header: 'Location' },
    { field: 'installation_date', header: 'Insatallation Date' },
    { field: 'active', header: 'Status' },
  ];
  ngOnInit(): void {
    this.fetchInitialData();
  }
  constructor(private apiService: ApiService) {}

  fetchInitialData(): void {
    forkJoin({
      equipments: this.apiService.get<any[]>('master/equipment/'),
      ships: this.apiService.get<any[]>('master/ship/'),
      sections: this.apiService.get<any[]>('master/section/'),
      commands: this.apiService.get<any[]>('master/command/'),
      equipmentShipDetails: this.apiService.get<any[]>(
        'sfd/equipment-ship-details/'
      ),
    }).subscribe({
      next: ({
        equipments,
        sections,
        ships,
        commands,
        equipmentShipDetails,
      }) => {
        //console.log(ships);
        const shipCard = this.shipCard.find((card) => card.label === 'Ships');
        if (shipCard) {
          shipCard.options = ships.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          //console.log(shipCard.options);
        }

        const latestSorted = equipmentShipDetails
          .slice() // make a copy to avoid mutating original
          .sort(
            (a, b) =>
              new Date(b.installation_date).getTime() -
              new Date(a.installation_date).getTime()
          );

        const latestEquipment = latestSorted[0]; // the most recent one
        //console.log('Latest installed equipment:', latestEquipment);

        // You can store this in a property if you want to use it elsewhere
        this.latestEquipmentInstalled = latestEquipment;
        const commandCard = this.cards.find((card) => card.label === 'Command');
        if (commandCard) {
          commandCard.options = commands.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          //console.log(commandCard.options);
        }
        this.equipments = equipments;
        this.activeEquipmentCount = this.equipments.filter(
          (eq: any) => eq.active === 1
        ).length;
        //console.log(equipments);
        //console.log(this.ships);

        this.ships = ships.map((ship: any) => ({
          ...ship,
          active: ship.active === 1 ? 'Active' : 'Inactive',
        }));
        // this.activeShipCount = this.ships.filter(
        //   (eq: any) => eq.active === 'Active'
        // ).length;
        // //console.log(this.activeShipCount);

        // //console.log(sections);

        // this.sections = sections || [];
        // this.sectionCount = this.sections.length;
        // this.calculateEquipmentDistribution();
      },
      error: (error: any) => {
        console.error('Error fetching initial dropdown data:', error);
      },
    });
  }
  getDashArray(count: number): string {
    const total = this.equipmentDetails.length || 1;
    const circumference = 2 * Math.PI * 80; // 2πr
    const percent = count / total;
    return `${percent * circumference} ${circumference}`;
  }

  getDashOffset(index: number): number {
    const total = this.equipmentDetails.length || 1;
    const circumference = 2 * Math.PI * 80;
    let offset = 0;

    for (let i = 0; i < index; i++) {
      offset += (this.equipmentChartData[i].count / total) * circumference;
    }

    return -offset;
  }

  calculateEquipmentDistribution(headers: any) {
    this.equipmentDistribution = {};

    headers.forEach((equipment: any) => {
      //console.log(equipment);
      const sectionName = equipment?.group?.section?.name || 'Unknown';
      if (this.equipmentDistribution[sectionName]) {
        this.equipmentDistribution[sectionName]++;
      } else {
        this.equipmentDistribution[sectionName] = 1;
      }
    });

    const colors = [
      '#B6B6F1',
      '#FF7743',
      '#58D0F5',
      '#FFD0D5',
      '#84e0ad',
      '#ffce54',
    ];
    let index = 0;

    this.equipmentChartData = Object.entries(this.equipmentDistribution).map(
      ([name, count]) => ({
        name,
        count,
        color: colors[index++ % colors.length],
      })
    );
  }
  statCards = [
    {
      title: 'Generic Specification',
      count: 12,
      caption: 'All ship specifications',
      route: '/sfd/generic-specification',
      icon: 'pi pi-file'
    },
    {
      title: 'SFD Hierarchy',
      count: 87,
      caption: 'Complete equipment structure',
      route: '/sfd/masters/sfd-hierarchy',
      icon: 'pi pi-cog'
    },
    {
      title: 'Ship Details',
      count: 9,
      caption: 'Detailed ship overview',
      route: '/sfd/equipment-ship-details',
      icon: 'pi pi-th-large'
    },
    {
      title: 'Equipment Policies',
      count: 2,
      caption: 'Configured installation rules',
      route: '/sfd/equipment-supplier',
      icon: 'pi pi-sliders-h'
    },
    {
      title: 'Equipment Details',
      count: 4,
      caption: 'Active equipment records',
      route: '/sfd/hide-equipment-details',
      icon: 'pi pi-send'
    },
    {
      title: 'Equipment Specifications',
      count: 6,
      caption: 'Upcoming servicing plans',
      route: '/sfd/equipment-specification',
      icon: 'pi pi-wrench'
    }
  ];
  
  
  
  
  ngOnDestroy(): void {
    this.sectionCount = 0;
    this.activeEquipmentCount = 0;
  }
}
