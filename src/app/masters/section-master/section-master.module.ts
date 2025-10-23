import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionMasterRoutingModule } from './section-master-routing.module';
import { SectionComponent } from './section/section.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SectionMasterRoutingModule,
    SectionComponent
  ]
})
export class SectionMasterModule { }
