import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { SharedLayoutComponent } from '../shared-layout/shared-layout.component';

interface ContactInfo {
  ser: string;
  section: string;
  systemController: {
    name: string;
    pax: string;
    nuc: string;
  };
  masterChief: {
    name: string;
    pax: string;
    nud: string;
  };
}

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatCardModule,
    SharedLayoutComponent
  ],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent {
  directorInfo = {
    director: 'Director - NCN - 22371',
    pax: 'PAX - 1971',
    nud: 'NUD - WNC-INSMA-DIRECTOR'
  };

  contacts: ContactInfo[] = [
    {
      ser: '1.',
      section: 'SFD, ABER',
      systemController: {
        name: 'Capt MA Zulfikar',
        pax: 'PAX - 1951',
        nuc: 'NUC - WNC-INSMA-ADDLJD'
      },
      masterChief: {
        name: 'Saurabh Malik, MCERA II',
        pax: 'PAX - 1386',
        nud: 'NUD - WNC-INSMA-SFDIC1'
      }
    },
    {
      ser: '2.',
      section: 'CMMS/ UM2',
      systemController: {
        name: 'Lt Cdr Hemant Rathore',
        pax: 'PAX - 1567',
        nuc: 'NUC - WNC-INSMA-SACMMS'
      },
      masterChief: {
        name: 'Rupesh Rawat, MCEA(P) I',
        pax: 'PAX - 1386',
        nud: 'NUD - WNC-INSMA-CMMSIC'
      }
    },
    {
      ser: '3.',
      section: 'SRAR, FUSS, ANNUAL REPORTS',
      systemController: {
        name: 'Lt Cdr Shubham Kumar',
        pax: 'PAX - 1972',
        nuc: 'NUC - WNC-INSMA-SACMMS'
      },
      masterChief: {
        name: 'Sushil Kumar Pandit, MCERA II',
        pax: 'PAX - 1386',
        nud: 'NUD - WNC-INSMA-SRRSTAFF1'
      }
    },
    {
      ser: '4.',
      section: 'MAINTOPS',
      systemController: {
        name: 'Cdr Asif Sarkhawas',
        pax: 'PAX - 1567',
        nuc: 'NUC - WNC-INSMA-SCSUMSE'
      },
      masterChief: {
        name: 'Rahul Kumar, MCERA II',
        pax: 'PAX - 1425',
        nud: 'NUC - WNC-INSMA-SUMSEIC'
      }
    },
    {
      ser: '5.',
      section: 'Documentation',
      systemController: {
        name: 'Cdr Anup Singh',
        pax: 'PAX - 1568',
        nuc: 'NUC - WNC-INSMA-SCSUMSL'
      },
      masterChief: {
        name: 'LO Singh, MCEA(R) II',
        pax: 'PAX - 1425',
        nud: 'NUC - WNC-INSMA-SUMSLIC1'
      }
    }
  ];

  additionalContacts = [
    {
      systemController: {
        name: 'Capt Manish P Joshi',
        pax: 'PAX - 2053',
        nuc: 'NUC - WNC-INSMA-JDSYSPROJ'
      },
      masterChief: {
        name: 'A Sridhar Kumar, JDO(E)',
        pax: 'PAX - 2052',
        nud: 'NUD - WNC-INSMA-JDO'
      }
    }
  ];
}
