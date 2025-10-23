import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedLayoutComponent } from '../shared-layout/shared-layout.component';

interface FunctionalArea {
  name: string;
  children: string[];
}

interface OrganizationData {
  title: string;
  established: string;
  charter: string;
  topLevel: string;
  director: string;
  adminSupport: string[];
  oic: string;
  functionalAreas: FunctionalArea[];
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, SharedLayoutComponent],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent {
  organizationData: OrganizationData = {
    title: 'INSMA Organization',
    established: 'Established in Nov 86',
    charter: 'Charter governed by NO 22/16',
    topLevel: 'NHQ [ACOM (D&R)] Functional Control',
    director: 'Director INSMA',
    adminSupport: [
      'HQWNC [CSO (TECH)] Admin Support',
      'HQENC [CSO (TECH)] Admin Support'
    ],
    oic: 'OIC SMA (V)',
    functionalAreas: [
      {
        name: 'Configuration Management',
        children: [
          'Naval Upkeep & Master Record Centre (NUMARC)',
          'CMMS-UM2',
          'SFD',
          'SRAR',
          'FUSS',
          'DART',
          'OPDEF-OPDEM',
          'STOREDEM',
          'Refit'
        ]
      },
      {
        name: 'Maintenance Management & Decision Support',
        children: [
          'Support Upkeep Maintenance System (SUMS)',
          'MAINTOPS',
          'Acquaints',
          'OPM/OPLR',
          'Data Analysis',
          'Rations'
        ]
      },
      {
        name: 'Knowledge Management',
        children: [
          'Documentation',
          'Curation & Cataloguing of Documents'
        ]
      },
      {
        name: 'Systems & Projects',
        children: [
          'Materiel Common Data Framework',
          'AI & ML Projects',
          'Collaboration with Industry & Academia'
        ]
      }
    ]
  };
}
