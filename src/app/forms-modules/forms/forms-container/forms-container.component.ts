import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegFormComponent } from '../seg-form/seg-form.component';
import { EtmaFormComponent } from '../preliminary-form/etma-form.component';
import { IntermediateFormComponent } from '../intermediate-form/intermediate-form.component';
import { FinalFormComponent } from '../final-form/final-form.component';
import { UwCompartmentsFormComponent } from '../uw-compartments-form/uw-compartments-form.component';

@Component({
  selector: 'app-forms-container',
  standalone: true,
  imports: [CommonModule, SegFormComponent, EtmaFormComponent, IntermediateFormComponent, FinalFormComponent, UwCompartmentsFormComponent],
  templateUrl: './forms-container.component.html',
  styleUrl: './forms-container.component.css'
})
export class FormsContainerComponent {
  activeTab = 'seg-form';
  
  tabs = [
    { id: 'seg-form', label: 'SEG Forms', component: 'seg-form' },
    { id: 'etma-form', label: 'ETMA Forms', component: 'etma-form' },
    { id: 'intermediate-form', label: 'Intermediate Forms', component: 'intermediate-form' },
    { id: 'final-form', label: 'Final Forms', component: 'final-form' },
    { id: 'uw-compartments-form', label: 'U/W Compartments Forms', component: 'uw-compartments-form' }
  ];

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }
}
