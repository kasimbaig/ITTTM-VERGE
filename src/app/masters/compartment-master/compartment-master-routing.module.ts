import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompartmentComponent } from './compartment/compartment.component';

const routes: Routes = [
  { path: '', component: CompartmentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompartmentMasterRoutingModule { }
