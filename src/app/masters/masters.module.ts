import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MastersRoutingModule } from './masters-routing.module';
import { MastersComponent } from './masters.component';
import { FormBuildingComponent } from './form-building/form-building.component';

@NgModule({
  declarations: [
    MastersComponent
  ],
  imports: [
    CommonModule,
    MastersRoutingModule,
    FormBuildingComponent
  ]
})
export class MastersModule { }
