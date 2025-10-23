import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrialUnitsComponent } from './trial-units/trial-units.component';

const routes: Routes = [
  { path: '', component: TrialUnitsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrialUnitsMasterRoutingModule { }
