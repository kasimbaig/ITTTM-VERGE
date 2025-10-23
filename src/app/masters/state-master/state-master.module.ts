import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateMasterRoutingModule } from './state-master-routing.module';
import { StateComponent } from './state/state.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StateMasterRoutingModule,
    StateComponent
  ]
})
export class StateMasterModule { }
