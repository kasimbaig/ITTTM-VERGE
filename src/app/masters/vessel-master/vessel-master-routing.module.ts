import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VesselComponent } from './vessel/vessel.component';

const routes: Routes = [
  { path: '', component: VesselComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VesselMasterRoutingModule { }
