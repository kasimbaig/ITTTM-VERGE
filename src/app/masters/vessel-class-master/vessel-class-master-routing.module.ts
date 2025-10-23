import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VesselClassComponent } from './vessel-class/vessel-class.component';

const routes: Routes = [
  { path: '', component: VesselClassComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VesselClassMasterRoutingModule { }
