import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropulsionComponent } from './propulsion/propulsion.component';

const routes: Routes = [
  { path: '', component: PropulsionComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PropulsionMasterRoutingModule { }
