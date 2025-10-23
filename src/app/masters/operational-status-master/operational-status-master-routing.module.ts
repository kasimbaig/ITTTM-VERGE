import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationalStatusComponent } from './operational-status/operational-status.component';

const routes: Routes = [
  { path: '', component: OperationalStatusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperationalStatusMasterRoutingModule { }
