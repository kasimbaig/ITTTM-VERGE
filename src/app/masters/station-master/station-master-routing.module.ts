import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StationComponent } from './station/station.component';

const routes: Routes = [
  {
    path: '',
    component: StationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StationMasterRoutingModule { }
