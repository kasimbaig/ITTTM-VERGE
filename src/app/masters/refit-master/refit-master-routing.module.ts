import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefitComponent } from './refit/refit.component';

const routes: Routes = [
  { path: '', component: RefitComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefitMasterRoutingModule { }
